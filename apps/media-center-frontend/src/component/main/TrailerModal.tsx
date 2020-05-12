import React from "react";
import Modal from "react-bootstrap/Modal";
import ResponsiveEmbed from "react-bootstrap/ResponsiveEmbed";

function getYoutubeEmbedLink(trailerLink: string) {
  const match = trailerLink.match(/v=([^&]+)/);
  if (!match) {
    return trailerLink;
  }

  return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
}

interface TrailerModalProps {
  trailer: string;
  title: string;
  show: boolean;
  onHide: () => void;
}

function TrailerModal({ trailer, title, onHide, show }: TrailerModalProps) {
  return (
    <Modal size="xl" show={show} onHide={onHide} animation={false}>
      <Modal.Body className="bg-dark">
        <button
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Close"
          onClick={onHide}
        >
          <span aria-hidden="true" className="text-light">
            &times;
          </span>
        </button>
        <ResponsiveEmbed aspectRatio="16by9">
          <iframe
            className="embed-responsive-item"
            src={getYoutubeEmbedLink(trailer)}
            title={title}
            allowFullScreen
            allow="autoplay; encrypted-media"
          ></iframe>
        </ResponsiveEmbed>
      </Modal.Body>
    </Modal>
  );
}

export default TrailerModal;
