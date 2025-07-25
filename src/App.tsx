import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import type { Video } from './interfaces';
import { setFingerprintCookie } from './functions';
import DnD from './dnd';
import VideoCard from './video-card';

function App() {
	const [files, setFiles] = useState<Video[]>([]);
	const fetchData = async () => {
		const url = import.meta.env.VITE_BACKEND_URL + '/all';
		try {
			await setFingerprintCookie();

			const response = await fetch(url, {
				method: 'GET',
				cache: 'no-store',
				credentials: 'include'
			});
			const result = await response.json();
			if (!response.ok) {
				throw new Error('Error: ' + result.message);
			}
			setFiles(result);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : String(err));
		}
	};

	const refresh = () => {
		fetchData();
		console.log('refresh');
	};
	useEffect(() => {
		fetchData();
	}, []);

	return (
		<Container className=" pt-5" fluid>
			<ToastContainer />

			<h1 className="text-center pb-5">EphemVid</h1>
			<DnD refresh={refresh} />
			<Row className="g-4 pt-5">
				{files.length > 0
					? files.map(file => {
							return (
								<Col key={file.filename} xs={12} md={4} lg={3}>
									<VideoCard video={file} refresh={refresh} />
									<div></div>
								</Col>
							);
					  })
					: null}
			</Row>
		</Container>
	);
}

export default App;
