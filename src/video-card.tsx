import { Card, Button, ButtonGroup, Spinner, Image, Dropdown, DropdownButton } from 'react-bootstrap';
import 'rc-slider/assets/index.css';
import { useState } from 'react';
import type { Video } from './interfaces';
import { setFingerprintCookie } from './functions';
import { toast } from 'react-toastify';
import EditModal from './edit-modal';
import icon from './assets/paperclip.svg';

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
	const [reloadTimestamp, setReloadTimestamp] = useState<number>(Date.now());
	const videoUrl = import.meta.env.VITE_BACKEND_URL + '/file/single/' + props.video.filename;
	const [loading, setLoading] = useState(false);
	const [showModal, setShowModal] = useState(false);

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(videoUrl);
			toast.success('Copied to clipboard');
		} catch (err) {
			toast.error("Couldn't copy to clipboard");
		}
	};

	const handleDownloadGif = async () => {
		const url = import.meta.env.VITE_BACKEND_URL + '/download/gif/' + props.video.filename;
		try {
			await setFingerprintCookie();
			const response = await fetch(url, {
				method: 'GET',
				credentials: 'include'
			});
			if (!response.ok) {
				toast.error('Something went wrong');
			}
			const result = await response.blob();
			const blob = window.URL.createObjectURL(result);

			const link = document.createElement('a');
			link.href = blob;
			link.setAttribute('download', props.video.filename.replace('.mp4', '.gif'));
			document.body.appendChild(link);
			link.click();
			link.remove();

			window.URL.revokeObjectURL(url);
			toast.success('gif downloaded successfully');
		} catch (err) {
			toast(err instanceof Error ? err.message : String(err));
		}
	};

	const handleDelete = async () => {
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
			<Card className="h-100 border border-secondary rounded-3 bg-dark text-white">
				{loading ? (
					<Spinner className="mx-auto my-5" animation="border" role="status" />
				) : (
					<video key={reloadTimestamp} controls className=" rounded-top" style={{ aspectRatio: '16/9' }}>
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
						{props.video.filename.slice(0, -13)}
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
							src={icon}
							onClick={copyToClipboard}
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
					</Card.Text>
					<ButtonGroup className="w-100">
						<DropdownButton as={ButtonGroup} title="Download" variant="success" className="w-100" menuVariant="dark">
							<Dropdown.Item>Video</Dropdown.Item>
							<Dropdown.Item onClick={handleDownloadGif}>GIF</Dropdown.Item>
						</DropdownButton>
						<Button variant="success" className="w-100" onClick={handleOpenModal}>
							Edit
						</Button>
						<Button variant="success" className="w-100" onClick={handleDelete}>
							Delete
						</Button>
					</ButtonGroup>
				</Card.Body>
			</Card>
			<EditModal show={showModal} setShow={setShowModal} video={props.video} videoUrl={videoUrl} secondsToTime={secondsToTime} setLoading={setLoading} setReloadTimestamp={setReloadTimestamp} />
		</>
	);
};

export default VideoCard;
