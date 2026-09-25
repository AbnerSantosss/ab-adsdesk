import { Fragment } from 'react';

/** Mostra o texto no formato do WhatsApp, com *negrito*, como aparece na conversa. */
export function WhatsAppText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <Fragment key={i}>
          {line.split(/(\*[^*\n]+\*)/g).map((part, j) =>
            part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
              <strong key={j}>{part.slice(1, -1)}</strong>
            ) : (
              <Fragment key={j}>{part}</Fragment>
            ),
          )}
          <br />
        </Fragment>
      ))}
    </>
  );
}
