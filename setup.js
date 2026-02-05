#!/usr/bin/env node

import * as p from '@clack/prompts';
import fs from 'fs';
import path from 'path';
import { getOrchestrator, resetOrchestrator } from './setup/utils/orchestrator.js';
import { getEnvGenerator, resetEnvGenerator } from './setup/utils/env-generator.js';
import { addDependencies, addDevDependencies, removeDependencies } from './setup/utils/package-modifier.js';
import { loadState, saveState, getAddedDependencies, removeState } from './setup/utils/state-manager.js';
import { copyDatabaseFiles, getDatabaseDeps, getDatabaseEnvVars } from './setup/features/database.js';
import { copyAuthFiles, getAuthDeps, getAuthEnvVars } from './setup/features/auth.js';
import { copyOtpFiles, getOtpDeps, getOtpEnvVars } from './setup/features/otp.js';
import { copyAiFiles, getAiDeps, getAiEnvVars } from './setup/features/ai.js';
import { copyJobsFiles, getJobsDeps, getJobsEnvVars } from './setup/features/jobs.js';
import { copyMessagingFiles, getMessagingDeps, getMessagingEnvVars } from './setup/features/messaging.js';
import { copyStorageFiles, getStorageDeps, getStorageEnvVars } from './setup/features/storage.js';
import { copyGraphicsFiles, getGraphicsDeps, getGraphicsEnvVars } from './setup/features/graphics.js';

// CLI argument parsing
const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(flag);
const getArg = (flag) => {
	const idx = args.indexOf(flag);
	return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
};

// Verbose logging
const VERBOSE = hasFlag('--verbose') || hasFlag('-v');
const log = (msg) => VERBOSE && p.log.info(msg);

// Feature compatibility validation
function validateFeatureCompatibility(config) {
	const errors = [];
	const warnings = [];

	// Auth requires database
	if (config.auth === 'lucia' && config.database === 'none') {
		errors.push('Lucia auth requires a database. Select a database option.');
	}

	// WhatsApp + BullMQ recommendation
	if (config.messaging?.includes('whatsapp-business-api') && config.backgroundJobs === 'none') {
		warnings.push('WhatsApp works better with BullMQ for reliable message delivery.');
	}

	// OTP without auth is unusual
	if (config.otpChannels?.length > 0 && config.auth === 'none') {
		warnings.push('OTP channels selected without auth. Consider adding auth.');
	}

	// BullMQ requires Redis (runtime warning)
	if (config.backgroundJobs === 'bullmq') {
		warnings.push('BullMQ requires REDIS_URL env var at runtime.');
	}

	return { errors, warnings };
}

// Presets
const PRESETS = {
	saas: {
		database: 'postgresql-18',
		auth: 'lucia',
		otpChannels: ['email-zeptomail'],
		messaging: [],
		aiFeatures: 'minimal',
		graphics3d: 'none',
		fileStorage: ['s3'],
		backgroundJobs: 'bullmq'
	},
	'ai-app': {
		database: 'postgresql-18',
		auth: 'lucia',
		otpChannels: [],
		messaging: [],
		aiFeatures: 'full',
		graphics3d: 'none',
		fileStorage: ['s3'],
		backgroundJobs: 'bullmq'
	},
	'3d': {
		database: 'none',
		auth: 'none',
		otpChannels: [],
		messaging: [],
		aiFeatures: 'none',
		graphics3d: 'threlte',
		fileStorage: [],
		backgroundJobs: 'none'
	},
	minimal: {
		database: 'sqlite',
		auth: 'none',
		otpChannels: [],
		messaging: [],
		aiFeatures: 'none',
		graphics3d: 'none',
		fileStorage: [],
		backgroundJobs: 'none'
	}
};

// Default selections for --yes flag
const DEFAULTS = PRESETS.saas;

async function main() {
	// Handle --help
	if (hasFlag('--help') || hasFlag('-h')) {
		console.log(`
Asamkhya Starter Template Setup

Usage: node setup.js [options]

Options:
  --yes, -y          Use recommended defaults (saas preset)
  --preset <name>    Use a preset: saas, ai-app, 3d, minimal
  --clean            Remove all feature files and reset package.json
  --force, -f        Skip confirmation prompts, overwrite existing files
  --dry-run          Preview changes without writing files
  --verbose, -v      Show detailed progress
  --help, -h         Show this help message

Presets:
  saas     PostgreSQL 18, Lucia auth, Email OTP, AI minimal, S3, BullMQ
  ai-app   PostgreSQL 18, Lucia auth, AI full, S3, BullMQ
  3d       Threlte 3D graphics only
  minimal  SQLite only
`);
		process.exit(0);
	}

	// Handle --clean
	if (hasFlag('--clean')) {
		p.intro('Asamkhya Starter Template - Clean');

		const force = hasFlag('--force') || hasFlag('-f');
		if (!force) {
			const confirm = await p.confirm({
				message: 'Remove all generated feature files? This cannot be undone.'
			});

			if (!confirm || p.isCancel(confirm)) {
				p.cancel('Clean cancelled');
				process.exit(0);
			}
		}

		const spinner = p.spinner();
		spinner.start('Cleaning feature files...');

		// Fallback dirs if no state file
		const fallbackDirs = [
			'src/lib/server/db',
			'src/lib/server/auth',
			'src/lib/server/otp',
			'src/lib/server/whatsapp',
			'src/lib/server/ai',
			'src/lib/server/storage',
			'src/lib/server/queues',
			'src/lib/components/3d',
			'src/lib/components/ai-elements',
			'src/lib/components/prompt-kit',
			'src/lib/components/prompt-kit-primitives',
			'src/routes/api/chat',
			'src/routes/api/whatsapp',
			'src/routes/files',
			'src/routes/3d-demo'
		];

		const state = loadState();
		if (!state) {
			log('No .setup-state.json found, using fallback directories');
		}

		// Remove directories
		const dirsToRemove = state ? [] : fallbackDirs;
		for (const dir of dirsToRemove) {
			const fullPath = path.join(process.cwd(), dir);
			if (fs.existsSync(fullPath)) {
				fs.rmSync(fullPath, { recursive: true, force: true });
			}
		}

		// If we have state, remove tracked files and their empty parent dirs
		if (state?.files?.created) {
			for (const file of state.files.created) {
				if (fs.existsSync(file)) {
					fs.unlinkSync(file);
					// Try to remove empty parent dirs
					let dir = path.dirname(file);
					while (dir !== process.cwd()) {
						try {
							fs.rmdirSync(dir);
							dir = path.dirname(dir);
						} catch {
							break; // Not empty
						}
					}
				}
			}
		}

		// Remove added dependencies from package.json
		const addedDeps = getAddedDependencies();
		if (Object.keys(addedDeps).length > 0) {
			spinner.message('Removing dependencies...');
			removeDependencies(Object.keys(addedDeps));
			log(`Removed ${Object.keys(addedDeps).length} dependencies`);
		}

		// Remove .env.example
		const envExample = path.join(process.cwd(), '.env.example');
		if (fs.existsSync(envExample)) {
			fs.unlinkSync(envExample);
		}

		// Remove state file
		removeState();

		spinner.stop('Feature files removed');
		p.outro('Clean complete. Run setup.js again to reconfigure.');
		process.exit(0);
	}

	p.intro('Asamkhya Starter Template Setup');

	let config;
	const presetName = getArg('--preset');

	if (presetName) {
		if (!PRESETS[presetName]) {
			p.log.error(`Unknown preset: ${presetName}. Available: ${Object.keys(PRESETS).join(', ')}`);
			process.exit(1);
		}
		config = { projectName: 'my-app', ...PRESETS[presetName] };
		p.log.info(`Using preset: ${presetName}`);
	} else if (hasFlag('--yes') || hasFlag('-y')) {
		config = { projectName: 'my-app', ...DEFAULTS };
		p.log.info('Using recommended defaults (saas preset)');
	} else {
		// Interactive mode
		config = await promptForConfig();
		if (!config) {
			p.cancel('Setup cancelled');
			process.exit(0);
		}
	}

	// Validate feature compatibility
	const { errors, warnings } = validateFeatureCompatibility(config);
	if (errors.length > 0) {
		for (const err of errors) p.log.error(err);
		process.exit(1);
	}
	for (const warn of warnings) p.log.warn(warn);

	// Show summary
	p.note(
		[
			`Project: ${config.projectName}`,
			`Database: ${config.database}`,
			`Auth: ${config.auth}`,
			`OTP Channels: ${config.otpChannels.length ? config.otpChannels.join(', ') : 'None'}`,
			`Messaging: ${config.messaging.length ? config.messaging.join(', ') : 'None'}`,
			`AI Features: ${config.aiFeatures}`,
			`3D Graphics: ${config.graphics3d}`,
			`File Storage: ${config.fileStorage.length ? config.fileStorage.join(', ') : 'None'}`,
			`Background Jobs: ${config.backgroundJobs}`
		].join('\n'),
		'Configuration Summary'
	);

	// Run setup
	await runSetup(config);
}

async function promptForConfig() {
	const projectName = await p.text({
		message: 'What is your project name?',
		placeholder: 'my-awesome-app',
		validate: (value) => {
			if (!value) return 'Project name is required';
			if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
				return 'Project name must contain only letters, numbers, hyphens, and underscores';
			}
			if (value.length > 214) {
				return 'Project name too long (max 214 characters)';
			}
		}
	});
	if (p.isCancel(projectName)) return null;

	const database = await p.select({
		message: 'Database',
		options: [
			{ value: 'postgresql-18', label: 'PostgreSQL 18' },
			{ value: 'postgresql', label: 'PostgreSQL' },
			{ value: 'mysql', label: 'MySQL' },
			{ value: 'mariadb', label: 'MariaDB' },
			{ value: 'sqlite', label: 'SQLite' },
			{ value: 'none', label: 'None' }
		]
	});
	if (p.isCancel(database)) return null;

	const auth = await p.select({
		message: 'Auth',
		options: [
			{ value: 'lucia', label: 'Lucia' },
			{ value: 'none', label: 'None' }
		]
	});
	if (p.isCancel(auth)) return null;

	const otpChannels = await p.multiselect({
		message: 'OTP Channels',
		options: [
			{ value: 'sms-message-central', label: 'SMS Message Central' },
			{ value: 'email-zeptomail', label: 'Email ZeptoMail' }
		],
		required: false
	});
	if (p.isCancel(otpChannels)) return null;

	const messaging = await p.multiselect({
		message: 'Messaging',
		options: [{ value: 'whatsapp-business-api', label: 'WhatsApp Business API' }],
		required: false
	});
	if (p.isCancel(messaging)) return null;

	const aiFeatures = await p.select({
		message: 'AI Features',
		options: [
			{ value: 'full', label: 'Full' },
			{ value: 'minimal', label: 'Minimal' },
			{ value: 'none', label: 'None' }
		]
	});
	if (p.isCancel(aiFeatures)) return null;

	const graphics3d = await p.select({
		message: '3D Graphics',
		options: [
			{ value: 'threlte', label: 'Threlte' },
			{ value: 'none', label: 'None' }
		]
	});
	if (p.isCancel(graphics3d)) return null;

	const fileStorage = await p.multiselect({
		message: 'File Storage',
		options: [
			{ value: 's3', label: 'S3-compatible' },
			{ value: 'local', label: 'Local disk' }
		],
		required: false
	});
	if (p.isCancel(fileStorage)) return null;

	const backgroundJobs = await p.select({
		message: 'Background Jobs',
		options: [
			{ value: 'bullmq', label: 'BullMQ + Redis' },
			{ value: 'none', label: 'None' }
		]
	});
	if (p.isCancel(backgroundJobs)) return null;

	return {
		projectName,
		database,
		auth,
		otpChannels,
		messaging,
		aiFeatures,
		graphics3d,
		fileStorage,
		backgroundJobs
	};
}

async function runSetup(config) {
	const spinner = p.spinner();
	const dryRun = hasFlag('--dry-run');

	if (dryRun) {
		spinner.start('Analyzing configuration (dry run)...');
	} else {
		spinner.start('Processing configuration...');
	}

	try {
		// Reset state for idempotency
		resetOrchestrator();
		resetEnvGenerator();

		const orch = getOrchestrator();
		const env = getEnvGenerator();

		// Track all dependencies for state file
		const allDeps = {};

		// Helper to collect deps
		const collectDeps = (deps) => {
			if (deps.dependencies) Object.assign(allDeps, deps.dependencies);
			if (deps.devDependencies) Object.assign(allDeps, deps.devDependencies);
			return deps;
		};

		// Base env vars
		env.addEnvVars({
			NODE_ENV: { description: 'Environment', example: 'development' },
			PUBLIC_APP_NAME: { description: 'Application name', example: config.projectName }
		});

		// Install features
		if (config.database !== 'none') {
			spinner.message('Installing database feature...');
			log(`Database: ${config.database}`);
			copyDatabaseFiles(config.database);
			const deps = collectDeps(getDatabaseDeps(config.database));
			if (deps.dependencies) addDependencies(deps.dependencies);
			if (deps.devDependencies) addDevDependencies(deps.devDependencies);
			env.addEnvVars(getDatabaseEnvVars(config.database));
		}

		if (config.auth !== 'none') {
			spinner.message('Installing auth feature...');
			log(`Auth: ${config.auth}`);
			copyAuthFiles(config.auth);
			const deps = collectDeps(getAuthDeps(config.auth));
			if (deps.dependencies) addDependencies(deps.dependencies);
			if (deps.devDependencies) addDevDependencies(deps.devDependencies);
			env.addEnvVars(getAuthEnvVars(config.auth));
		}

		if (config.otpChannels?.length > 0) {
			spinner.message('Installing OTP features...');
			log(`OTP: ${config.otpChannels.join(', ')}`);
			copyOtpFiles(config.otpChannels);
			const deps = collectDeps(getOtpDeps(config.otpChannels));
			if (deps.dependencies) addDependencies(deps.dependencies);
			if (deps.devDependencies) addDevDependencies(deps.devDependencies);
			env.addEnvVars(getOtpEnvVars(config.otpChannels));
		}

		if (config.messaging?.length > 0) {
			spinner.message('Installing messaging features...');
			log(`Messaging: ${config.messaging.join(', ')}`);
			copyMessagingFiles(config.messaging);
			const deps = collectDeps(getMessagingDeps(config.messaging));
			if (deps.dependencies) addDependencies(deps.dependencies);
			if (deps.devDependencies) addDevDependencies(deps.devDependencies);
			env.addEnvVars(getMessagingEnvVars(config.messaging));
		}

		if (config.aiFeatures !== 'none') {
			spinner.message('Installing AI feature...');
			log(`AI: ${config.aiFeatures}`);
			copyAiFiles(config.aiFeatures);
			const deps = collectDeps(getAiDeps(config.aiFeatures));
			if (deps.dependencies) addDependencies(deps.dependencies);
			if (deps.devDependencies) addDevDependencies(deps.devDependencies);
			env.addEnvVars(getAiEnvVars(config.aiFeatures));
		}

		if (config.graphics3d !== 'none') {
			spinner.message('Installing graphics feature...');
			log(`Graphics: ${config.graphics3d}`);
			copyGraphicsFiles(config.graphics3d);
			const deps = collectDeps(getGraphicsDeps(config.graphics3d));
			if (deps.dependencies) addDependencies(deps.dependencies);
			if (deps.devDependencies) addDevDependencies(deps.devDependencies);
			env.addEnvVars(getGraphicsEnvVars(config.graphics3d));
		}

		if (config.fileStorage?.length > 0) {
			spinner.message('Installing storage feature...');
			log(`Storage: ${config.fileStorage.join(', ')}`);
			copyStorageFiles(config.fileStorage);
			const deps = collectDeps(getStorageDeps(config.fileStorage));
			if (deps.dependencies) addDependencies(deps.dependencies);
			if (deps.devDependencies) addDevDependencies(deps.devDependencies);
			env.addEnvVars(getStorageEnvVars(config.fileStorage));
		}

		if (config.backgroundJobs !== 'none') {
			spinner.message('Installing jobs feature...');
			log(`Jobs: ${config.backgroundJobs}`);
			copyJobsFiles(config.backgroundJobs);
			const deps = collectDeps(getJobsDeps(config.backgroundJobs));
			if (deps.dependencies) addDependencies(deps.dependencies);
			if (deps.devDependencies) addDevDependencies(deps.devDependencies);
			env.addEnvVars(getJobsEnvVars(config.backgroundJobs));
		}

		// Generate .env.example
		const envExamplePath = path.join(process.cwd(), '.env.example');
		const envContent = env.generateContent();
		orch.stageFile(envExamplePath, envContent);

		const staged = orch.getStagedCount();

		if (dryRun) {
			spinner.stop('Dry run complete');
			p.note(
				[
					`Files to create: ${staged.files}`,
					`Dependencies to add: ${Object.keys(allDeps).length}`,
					...Object.entries(allDeps).slice(0, 10).map(([k, v]) => `  ${k}: ${v}`),
					Object.keys(allDeps).length > 10 ? `  ...and ${Object.keys(allDeps).length - 10} more` : ''
				].filter(Boolean).join('\n'),
				'Dry Run Summary'
			);
			p.outro('No files written. Remove --dry-run to apply changes.');
			return;
		}

		spinner.message(`Writing ${staged.files} file(s)...`);

		const result = orch.commit();

		// Save state for future --clean
		saveState(config, result.files, allDeps);
		log('State saved to .setup-state.json');

		spinner.stop(`Created ${result.files.length} file(s)`);

		// Post-setup checklist
		printPostSetupChecklist(config);

		p.outro('Setup complete! Run `pnpm install` to install new dependencies.');
	} catch (error) {
		spinner.stop('Setup failed');

		try {
			const orch = getOrchestrator();
			orch.rollback();
		} catch (rollbackError) {
			p.log.warn(`Rollback failed: ${rollbackError.message}`);
		}

		if (error.code === 'ENOENT') {
			p.log.error(`File not found: ${error.path || error.message}`);
		} else if (error.code === 'EACCES') {
			p.log.error(`Permission denied: ${error.path || error.message}`);
		} else if (error.code === 'ENOSPC') {
			p.log.error('Disk full - cannot write files');
		} else {
			p.log.error(`Error: ${error.message}`);
		}
		process.exit(1);
	}
}

function printPostSetupChecklist(config) {
	const steps = [];

	steps.push('1. Copy .env.example to .env and fill in your credentials');

	if (config.database !== 'none') {
		steps.push('2. Set DATABASE_URL in .env');
		steps.push('   Run migrations: npx kysely migrate:latest');
	}

	if (config.auth !== 'none') {
		steps.push('3. Update src/hooks.server.ts to include auth middleware:');
		steps.push('   import { authHandle } from "$lib/server/auth/middleware"');
		steps.push('   export const handle = sequence(i18n.handle(), authHandle)');
		steps.push('   See: features/auth/lucia/hooks.patch.ts for example');
	}

	if (config.messaging?.includes('whatsapp-business-api')) {
		steps.push('4. Configure WhatsApp webhook at /api/whatsapp/webhook');
		steps.push('   Set WHATSAPP_* env vars in .env');
	}

	if (config.aiFeatures !== 'none') {
		steps.push('5. Set OPENROUTER_API_KEY in .env for AI features');
	}

	if (config.backgroundJobs !== 'none') {
		steps.push('6. Set REDIS_URL in .env for background jobs');
	}

	if (steps.length > 1) {
		p.note(steps.join('\n'), 'Next Steps');
	}
}

main().catch(console.error);
