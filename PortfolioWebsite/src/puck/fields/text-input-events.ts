export interface EditorTextInputEvent {
  stopPropagation: () => void;
}

/**
 * Keep text editing gestures inside the field so Puck's document-level
 * shortcuts and drag handlers cannot replace native input behaviour.
 */
export function isolateEditorTextInputEvent(event: EditorTextInputEvent): void {
  event.stopPropagation();
}
