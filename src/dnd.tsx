import { Container, Card, Button, Image, Form } from 'react-bootstrap';
import { useState, useRef } from 'react';
import type { DragEvent } from 'react';
import icon from './assets/cloud-arrow-down.svg';
import { toast } from 'react-toastify';
import { setFingerprintCookie } from './functions';
interface Props {
	refresh: () => void;
}
const supportedMimetypes = [
	'video/mp4',
	'video/quicktime', // .mov
	'video/webm'
];
const DnD = (props: Props) => {
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
		if (e.dataTransfer.files.length > 10) {
			toast.warn('Too many files were given');
			return;
		}
		for (const file of e.dataTransfer.files) {
			if (!supportedMimetypes.includes(file.type)) {
				toast.warn('Wrong file type');
				return;
			}
			uploadVideo(file);
		}
	};
	const handleClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			if (e.target.files.length > 10) {
				toast.warn('Too many files were given');
				return;
			}
			for (const file of e.target.files) {
				if (!supportedMimetypes.includes(file.type)) {
					toast.warn('Wrong file type');
				} else {
					uploadVideo(file);
				}
			}
		}
	};

	async function uploadVideo(file: File) {
		if (file.size > 200 * 1024 * 1024) {
			toast.warn('File is too big (limit:200MB)');
			return;
		}
		const url = import.meta.env.VITE_BACKEND_URL + '/upload';
		const formData = new FormData();
		formData.append('video', file);
		try {
			await setFingerprintCookie();
			const response = await fetch(url, {
				method: 'POST',
				credentials: 'include',
				body: formData
			});
			const result = await response.json();
			if (!response.ok) {
				throw new Error(`Error: ${result.message}`);
			}
			props.refresh();
			toast.success(result.message);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : String(err));
		}
	}
	return (
		<Container onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
			<Card className="mx-auto rounded-3 bg-dark-custom text-white" style={{ maxWidth: '500px', border: '3px dashed #bb8c00ff' }}>
				<Card.Body className="text-center p-4">
					<Card.Title className="mb-3">Drag and Drop files</Card.Title>
					<Card.Subtitle className="text-secondary pb-3">or browse manually</Card.Subtitle>
					{isDragging ? (
						<Image alt="Drag and drop cloud" className="w-25 white" fluid src={icon} />
					) : (
						<div>
							<Form.Control type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept=".mp4, .mov, .mkv, .avi, .webm" style={{ display: 'none' }} />
							<Button className="btn btn-gold-dark" onClick={handleClick}>
								Browse Files
							</Button>
						</div>
					)}
				</Card.Body>
			</Card>
		</Container>
	);
};

export default DnD;
