import React from 'react';
import Bin from '../images/delete.png';
import Close from '../images/close.png';

export interface DeleteModalProps {
	modalName: string;
	modalID: string | number;
	modalDeleteAction: Function;
	modalCloseAction: Function;
}

const DeleteModal: React.FC<DeleteModalProps> = (props) => {
	const { modalName, modalID, modalDeleteAction, modalCloseAction } = props;

	return (
		<div className="delete-modal">
			<div className="delete-modal__modal">
				<div className="delete-modal__modal__bin-container">
					<img src={Bin} alt="bin" />
				</div>
				<span onClick={() => modalCloseAction()} className="delete-modal__modal__close">
					<img src={Close} alt="close" />
				</span>
				<h4>You're about to delete a {modalName}</h4>
				<p>
					Are you sure you want to <span>permanently delete</span> this {modalName}?
				</p>
				<div className="button-group">
					<button type="button" onClick={() => modalCloseAction()}>
						Cancel
					</button>
					<button type="button" onClick={() => modalDeleteAction(modalID)}>
						Delete
					</button>
				</div>
			</div>
		</div>
	);
};

export default DeleteModal;
