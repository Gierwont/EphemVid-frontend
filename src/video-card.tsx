import { Card, Button, ButtonGroup, Spinner, Image, Dropdown, DropdownButton } from 'react-bootstrap';
import 'rc-slider/assets/index.css';
import { useState } from 'react';
import type { Video } from './interfaces';
import { setFingerprintCookie } from './functions';
import { toast } from 'react-toastify';
import EditModal from './edit-modal';
import paperclip from './assets/paperclip.svg';

interface Props {
	video: Video;
	refresh: () => void;
}

function secondsToTime(seconds: number) {
	const hrs = Math.floor(seconds / 3600);
	const mins = Math.floor((seconds % 3600) / 60);
	const secs = (seconds % 60).toFixed(3);

	return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${secs.padStart(6, '0')}`;
}

const VideoCard = (props: Props) => {
	const videoUrl = import.meta.env.VITE_BACKEND_URL + '/file/single/' + props.video.filename;
	const [loading, setLoading] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(videoUrl);
			toast.success('Copied to clipboard');
		} catch (err) {
			toast.error("Couldn't copy to clipboard");
		}
	};
	const handleDownload = async (ext: string) => {
		const url = import.meta.env.VITE_BACKEND_URL + `/download/${ext}/` + props.video.filename;
		const toastId = toast.loading('Download in progress...');
		setIsDownloading(true);
		try {
			await setFingerprintCookie();
			const response = await fetch(url, {
				method: 'GET',
				credentials: 'include'
			});

			if (!response.ok) {
				throw new Error('Something went wrong');
			}
			const result = await response.blob();

			const blobUrl = window.URL.createObjectURL(result);

			const link = document.createElement('a');
			link.href = blobUrl;
			link.setAttribute('download', props.video.filename.replace(/\.[^/.]+$/, '.' + ext));
			document.body.appendChild(link);
			link.click();
			link.remove();

			window.URL.revokeObjectURL(blobUrl);

			toast.update(toastId, {
				render: 'Downloaded successfully',
				type: 'success',
				isLoading: false,
				autoClose: 5000,
				closeButton: true
			});
		} catch (err) {
			toast.update(toastId, {
				render: err instanceof Error ? err.message : String(err),
				type: 'error',
				isLoading: false,
				autoClose: 5000,
				closeButton: true
			});
		} finally {
			setIsDownloading(false);
		}
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		const url = import.meta.env.VITE_BACKEND_URL + '/delete/' + props.video.id;
		try {
			const response = await fetch(url, {
				method: 'DELETE'
			});
			const result = await response.json();
			if (!response.ok) {
				throw new Error('Error: ' + result.message);
			}
			toast.success('Video deleted');
			props.refresh();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : String(err));
		}
	};
	const handleOpenModal = () => setShowModal(true);

	return (
		<>
			<Card className="h-100 border border-secondary rounded-3 bg-dark-custom text-white">
				{loading ? (
					<Spinner className="mx-auto my-5" animation="border" role="status" />
				) : (
					<video controls className=" rounded-top" style={{ aspectRatio: '16/9' }}>
						<source src={videoUrl} type="video/mp4" />
						Your browser doesn't support video
					</video>
				)}

				<Card.Body className="p-2">
					<Card.Title
						style={{
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis'
						}}
					>
						{props.video.filename.slice(0, -9)}
					</Card.Title>
					<hr></hr>
					<Card.Text
						style={{
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap'
						}}
					>
						<a
							target="_blank"
							style={{
								color: 'lightgreen',
								textDecoration: 'none'
							}}
							href={videoUrl}
						>
							{videoUrl}
						</a>
						<Image
							fluid
							src={paperclip}
							onClick={copyToClipboard}
							alt="paperclip"
							style={{
								marginLeft: '6px',
								cursor: 'pointer',
								transition: 'transform 0.2s ease',
								height: '20px',
								width: '20px'
							}}
							onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.2)')}
							onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
						/>
						<br></br>
					</Card.Text>
					<div style={{ color: '#00ff99', fontFamily: 'monospace', fontSize: '16px' }}>
						Current size : <span style={{ fontWeight: 'bold', fontSize: '17px' }}>≈{(props.video.size / 1000000).toFixed(2)} MB</span>
					</div>

					<ButtonGroup className="w-100" size="sm">
						<DropdownButton
							as={ButtonGroup}
							title="Download"
							variant="success"
							menuVariant="dark"
							className="flex-grow-1 fs-6" // trochę większy font
							disabled={loading || isDeleting}
						>
							{['mp4', 'mov', 'webm', 'avi', 'mkv', 'gif'].map(format => (
								<Dropdown.Item key={format} onClick={() => handleDownload(format)}>
									.{format}
								</Dropdown.Item>
							))}
						</DropdownButton>

						<Button
							variant="success"
							className="fs-6"
							onClick={handleOpenModal}
							disabled={loading || isDownloading || isDeleting}
						>
							Edit
						</Button>

						<Button
							variant="success"
							className="fs-6"
							onClick={handleDelete}
							disabled={loading || isDownloading || isDeleting}
						>
							Delete
						</Button>
					</ButtonGroup>

				</Card.Body>
			</Card>
			<EditModal
				show={showModal}
				setShow={setShowModal}
				video={props.video}
				videoUrl={videoUrl}
				secondsToTime={secondsToTime}
				setLoading={setLoading}
				refresh={props.refresh}
			/>
		</>
	);

};

export default VideoCard;
