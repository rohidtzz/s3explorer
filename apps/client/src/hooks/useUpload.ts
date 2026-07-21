// Thin wrapper over react-dropzone that no-ops on native builds.
//
// Rationale: react-dropzone exists purely for desktop drag-and-drop. On a
// Capacitor Android build there is no drag source, so we skip the library
// entirely to save ~15-20KB gzipped from the main bundle chunk and avoid
// the DOM event listeners it wires up.
import { useDropzone } from 'react-dropzone';
import { isNative } from '../native';

type Props = { onDrop: (files: File[]) => void };

// Match the subset of the react-dropzone API we actually consume in App.tsx.
// Returning empty objects for the spreadable props keeps the JSX call sites
// identical whether we're on web or native.
type UseUploadReturn = {
  getRootProps: () => Record<string, unknown>;
  getInputProps: () => Record<string, unknown>;
  isDragActive: boolean;
};

// Native fallback for `getInputProps`. It's spread onto a bare `<input>` in
// App.tsx, so we MUST return props that make it a hidden file input — otherwise
// React renders a plain visible text input at the top of the page, which is
// exactly what happened before: a mystery grey band the user could tap to open
// the keyboard. Setting type=file + hidden style keeps the JSX safe on native.
const HIDDEN_FILE_INPUT_PROPS = {
  type: 'file' as const,
  multiple: true,
  autoComplete: 'off',
  tabIndex: -1,
  style: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: '1px',
    margin: '-1px',
    overflow: 'hidden',
    padding: 0,
    position: 'absolute' as const,
    width: '1px',
    whiteSpace: 'nowrap' as const,
  },
};

export function useUpload({ onDrop }: Props): UseUploadReturn {
  // Hooks must always be called unconditionally. We call useDropzone in both
  // branches but throw its result away on native, then return static no-ops.
  const dropzone = useDropzone({ onDrop, noClick: true });
  if (isNative) {
    return {
      getRootProps: () => ({}),
      getInputProps: () => HIDDEN_FILE_INPUT_PROPS,
      isDragActive: false,
    };
  }
  return dropzone;
}

