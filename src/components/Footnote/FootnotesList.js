import React, { useContext, useEffect, useState } from 'react';
import { FootnotesContext } from './FootnotesProvider';

const FootnotesList = () => {
  const context = useContext(FootnotesContext);
  const [footnotes, setFootnotes] = useState([]);
  
  useEffect(() => {
    if (context && context.footnotes) {
      // Use context footnotes if available
      setFootnotes(context.footnotes);
    } else if (typeof window !== 'undefined' && window.globalFootnotes) {
      // Fallback to global footnotes
      setFootnotes(window.globalFootnotes);
    } else {
      setFootnotes([]);
    }
  }, [context, context?.footnotes]);

  // Clear footnotes when component unmounts (page navigation)
  useEffect(() => {
    if (context && context.clearFootnotes) {
      return () => {
        context.clearFootnotes();
      };
    } else {
      // Clear global footnotes
      return () => {
        if (typeof window !== 'undefined') {
          window.globalFootnotes = [];
          window.globalFootnoteMap = new Map();
        }
      };
    }
  }, [context]);

  if (!footnotes || footnotes.length === 0) {
    return null;
  }

  const handleBackClick = (footnoteNumber) => (e) => {
    e.preventDefault();
    const refElement = document.getElementById(`footnote-ref-${footnoteNumber}`);
    if (refElement) {
      refElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const listStyles = {
    borderTop: '2px solid #e0e0e0',
    marginTop: '4rem',
    paddingTop: '2rem',
    fontSize: '0.9em',
    lineHeight: '1.6'
  };

  const titleStyles = {
    fontSize: '1.25em',
    fontWeight: 'bold', 
    marginBottom: '1.5rem',
    color: '#333',
    fontFamily: 'inherit'
  };

  const itemStyles = {
    marginBottom: '0.8rem',
    display: 'flex',
    alignItems: 'flex-start'
  };

  const numberStyles = {
    fontWeight: 'bold',
    marginRight: '0.5rem',
    minWidth: '1.5em',
    color: '#1976d2'
  };

  const contentStyles = {
    flex: 1
  };

  // Function to safely render footnote content
  const renderFootnoteContent = (content) => {
    if (typeof content === 'string') {
      return <span>{content}</span>;
    } else if (React.isValidElement(content)) {
      return content;
    } else if (Array.isArray(content)) {
      // Handle array of mixed content (strings and elements)
      return content.map((item, index) => {
        if (typeof item === 'string') {
          return <span key={index}>{item}</span>;
        } else if (React.isValidElement(item)) {
          return React.cloneElement(item, { key: index });
        } else {
          return <span key={index}>{String(item)}</span>;
        }
      });
    } else if (typeof content === 'object' && content !== null) {
      // Try to extract text content from object
      if (content.props && content.props.children) {
        return renderFootnoteContent(content.props.children);
      } else {
        return <span>{String(content)}</span>;
      }
    } else {
      return <span>{String(content)}</span>;
    }
  };

  const backLinkStyles = {
    marginLeft: '0.5rem',
    color: '#1976d2',
    textDecoration: 'none',
    fontSize: '0.8em'
  };

  return (
    <div style={listStyles}>
      <h3 style={titleStyles}>Footnotes</h3>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {footnotes.map((footnote) => (
          <li key={footnote.number} style={itemStyles}>
            <span 
              id={`footnote-${footnote.number}`}
              style={numberStyles}
            >
              {footnote.number}.
            </span>
            <div style={contentStyles}>
              {renderFootnoteContent(footnote.content)}
              <a
                href={`#footnote-ref-${footnote.number}`}
                onClick={handleBackClick(footnote.number)}
                style={backLinkStyles}
                title="Back to reference"
              >
                ↩
              </a>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default FootnotesList;
