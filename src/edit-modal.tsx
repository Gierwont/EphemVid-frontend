import { Modal, Button, ButtonGroup, DropdownButton, Form } from 'react-bootstrap';
import Slider from 'rc-slider';
import { Rnd } from 'react-rnd';
import type { editOptions, Video } from './interfaces';
import { useState, useRef } from 'react';
import { toast } from 'react-toastify';

interface Props {
	show: boolean;
	setShow: React.Dispatch<React.SetStateAction<boolean>>;
	video: Video;
	videoUrl: string;
	secondsToTime: (seconds: number) => string;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setReloadTimestamp: React.Dispatch<React.SetStateAction<number>>;
}

const sliderStyles = {
	track: { backgroundColor: 'limegreen', height: 4 },
	rail: { backgroundColor: '#ddd', height: 4 },
	handle: {
		borderColor: 'limegreen',
		height: 18,
		width: 18,
		marginTop: -6,
		backgroundColor: 'white'
	}
};

const EditModal = (props: Props) => {
	const [size, setSize] = useState<number>(Math.round((props.video.size / 1000000) * 100) / 100);
	const [compress, setCompress] = useState<boolean>(false);
	const [showCrop, setShowCrop] = useState<boolean>(false);
	const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
	const [range, setRange] = useState<number[]>([0, props.video.duration]);
	const [showSlider, setShowSlider] = useState<boolean>(false);

	const videoRef = useRef<HTMLVideoElement>(null);

	const handleNewSize = (value: number | number[]) => {
		if (typeof value == 'number') {
			setSize(value);
		}
	};
	const handleChange = (value: number | number[]) => {
		if (Array.isArray(value)) {
			setRange(value);
			if (videoRef.current) {
				videoRef.current.currentTime = value[0];
			}
		}
	};
	const handleCloseModal = () => {
		props.setShow(false);
		setShowSlider(false);
		setShowCrop(false);
	};

	const handleEditSave = async () => {
		props.setLoading(true);
		const options: editOptions = { id: props.video.id };
		if (showSlider) {
			options.startTime = range[0];
			options.endTime = range[1];
		}
		if (compress) {
			options.compressTo = Math.round(size * 1000);
		}
		if (showCrop) {
			options.cropX = crop.x;
			options.cropY = crop.y;
			options.cropHeight = crop.h;
			options.cropWidth = crop.w;
		}
		handleCloseModal();
		const url = import.meta.env.VITE_BACKEND_URL + '/edit';
		try {
			const response = await fetch(url, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(options)
			});
			const result = await response.json();
			if (!response.ok) {
				throw new Error('Error: ' + result.message);
			}
			toast.success('File edited succesfully');
		} catch (err) {
			toast.error(err instanceof Error ? err.message : String(err));
		} finally {
			props.setLoading(false);
			props.setReloadTimestamp(Date.now());
		}
	};
	return (
		<Modal show={props.show} centered backdrop="static" contentClassName="bg-dark text-white">
			<Modal.Header closeButton closeVariant="white" onClick={handleCloseModal}>
				<Modal.Title>Edit Video</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div style={{ position: 'relative', height: 'auto' }}>
					<video ref={videoRef} src={props.videoUrl} style={{ width: '100%', display: 'block' }} controls />
					{showCrop ? (
						<Rnd
							bounds="parent"
							default={{
								x: 0,
								y: 0,
								width: 30,
								height: 30
							}}
							onDragStop={(e, d) => setCrop({ ...crop, x: d.x, y: d.y })}
							onResizeStop={(e, direction, ref, delta, position) => {
								setCrop({
									x: position.x,
									y: position.y,
									w: parseInt(ref.style.width),
									h: parseInt(ref.style.height)
								});
							}}
							style={{ border: '2px dashed limegreen', zIndex: 10 }}
						></Rnd>
					) : null}
				</div>
				{showSlider ? (
					<div className="pt-2">
						<Slider styles={sliderStyles} style={{ width: '90%', margin: 'auto' }} range min={0} max={props.video.duration} value={range} onChange={handleChange} allowCross={false} step={0.01} />
						<p className="text-center">
							{' '}
							From {props.secondsToTime(range[0])} To {props.secondsToTime(range[1])}
						</p>
					</div>
				) : null}

				<ButtonGroup className="w-100 pt-1">
					<Button
						variant={showSlider ? 'success' : 'outline-success'}
						className="w-100"
						onClick={() => {
							setShowSlider(!showSlider);
						}}
					>
						Cut
					</Button>
					<Button
						variant={showCrop ? 'success' : 'outline-success'}
						className="w-100"
						onClick={() => {
							setShowCrop(!showCrop);
						}}
					>
						Crop
					</Button>

					<DropdownButton title="Download" variant={compress ? 'success' : 'outline-success'} className="w-100" as={ButtonGroup} menuVariant="dark">
						<Form.Switch label="Compress" onChange={() => setCompress(!compress)} checked={compress} style={{ marginLeft: '10px' }} />
						{compress ? (
							<div style={{ padding: '10px 20px', width: 200 }}>
								<Slider styles={sliderStyles} min={0} max={Math.round((props.video.size / 1000000) * 100) / 100} step={0.01} value={size} onChange={handleNewSize} />
								<div style={{ marginTop: 10 }}>Compress to: {size} MB</div>
							</div>
						) : null}
					</DropdownButton>
				</ButtonGroup>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleCloseModal}>
					Cancel
				</Button>
				<Button variant="warning" onClick={handleEditSave}>
					Edit
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default EditModal;
