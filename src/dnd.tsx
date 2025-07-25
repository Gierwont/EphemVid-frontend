import { Container, Card, Button, Image, Form } from 'react-bootstrap';
import { useState, useRef } from 'react';
import type { DragEvent } from 'react';
import icon from './assets/cloud-arrow-down.svg';
import { toast } from 'react-toastify';
import { setFingerprintCookie } from './functions';
interface Props {
	refresh: () => void;
}
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
		if (e.dataTransfer.files.length !== 1) {
			toast.warn('Too many files were given');
			return;
		}
		const file = e.dataTransfer.files[0];
		if (file.type !== 'video/mp4') {
			toast.warn('Wrong file type');
			return;
		}
		uploadVideo(file);
	};
	const handleClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			uploadVideo(file);
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
			<Card className="mx-auto rounded-3 bg-dark text-white" style={{ maxWidth: '500px', border: '3px dashed gray' }}>
				<Card.Body className="text-center p-4">
					<Card.Title className="mb-3">Drag and Drop files</Card.Title>
					<Card.Subtitle className="text-secondary pb-3">or browse manually!</Card.Subtitle>
					{isDragging ? (
						<Image className="w-25 white" fluid src={icon} />
					) : (
						<div>
							<Form.Control type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/mp4" style={{ display: 'none' }} />
							<Button variant="outline-success" onClick={handleClick}>
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
