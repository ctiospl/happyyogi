export interface WebhookPayload {
  object: string;
  entry: WebhookEntry[];
}

export interface WebhookEntry {
  id: string;
  changes: WebhookChange[];
}

export interface WebhookChange {
  value: {
    messaging_product: string;
    metadata: { display_phone_number: string; phone_number_id: string };
    contacts?: { profile: { name: string }; wa_id: string }[];
    messages?: IncomingMessage[];
    statuses?: MessageStatus[];
  };
  field: string;
}

export interface IncomingMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contacts' | 'interactive' | 'button';
  text?: { body: string };
  image?: MediaObject;
  audio?: MediaObject;
  video?: MediaObject;
  document?: MediaObject & { filename?: string };
  location?: { latitude: number; longitude: number; name?: string; address?: string };
  interactive?: { type: string; button_reply?: { id: string; title: string }; list_reply?: { id: string; title: string } };
  button?: { text: string; payload: string };
}

export interface MediaObject {
  id: string;
  mime_type: string;
  sha256?: string;
  caption?: string;
}

export interface MessageStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: { code: number; title: string }[];
}

export function isTextMessage(msg: IncomingMessage): msg is IncomingMessage & { text: { body: string } } {
  return msg.type === 'text' && !!msg.text;
}

export function isMediaMessage(msg: IncomingMessage): boolean {
  return ['image', 'audio', 'video', 'document'].includes(msg.type);
}
