// Node.js version check utility

export default function checkNodeVersion() {
  const nodeVersion = parseInt(process.versions.node.split('.')[0]);
  if (nodeVersion < 18) {
    console.error(`Node.js 18+ required. You have v${process.versions.node}`);
    process.exit(1);
  }
}
