import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from './App';
import './styles.css';

let root: Root;
if (import.meta.hot) {
  root =
    (import.meta.hot.data.root as Root | undefined) ?? createRoot(document.getElementById('root')!);
  import.meta.hot.data.root = root;
} else {
  root = createRoot(document.getElementById('root')!);
}
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
