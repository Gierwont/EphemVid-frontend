import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Image } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import type { Video } from './interfaces';
import { setFingerprintCookie } from './functions';
import DnD from './dnd';
import VideoCard from './video-card';
import githubLogo from './assets/github-logo.svg';

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
			<ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss={false} draggable pauseOnHover theme="dark" />

			<h1
				className="text-center display-1 pb-5 shimmering-text"
				style={{
					letterSpacing: '2px',
					fontFamily: 'Orbitron, sans-serif',

					textShadow: '0 0 5px rgba(212, 175, 55, 0.5)'
				}}
			>
				EphemVid
			</h1>
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
			<section className="pt-5">
				<hr></hr>
				<h2 className="text-center mb-3" style={{ fontFamily: 'Orbitron, sans-serif', color: 'lightgreen' }}>
					About EphemVid
				</h2>
				<p className="text-center fs-5 mx-auto" style={{ maxWidth: '700px', lineHeight: '1.6' }}>
					EphemVid is a simple Single Page Application for anonymously uploading, editing, and converting videos. Videos disappear automatically after 24 hours, ensuring privacy and temporary sharing.
					Each user can upload up to 10 videos at a time.
				</p>
				<div className="d-flex justify-content-center gap-4 flex-wrap text-center mx-auto" style={{ maxWidth: '700px' }}>
					<div className="flex-fill">
						<p className="fs-5">Supported upload formats:</p>
						<ul className="list-unstyled d-inline-block text-start">
							<li>
								<span className="text-warning text-decoration-underline">MP4</span>
							</li>
							<li>
								<span className="text-warning text-decoration-underline">MOV</span>
							</li>
							<li>
								<span className="text-warning text-decoration-underline">WEBM</span>
							</li>
						</ul>
					</div>

					<div className="flex-fill">
						<p className="fs-5">Available download formats:</p>
						<ul className="list-unstyled d-inline-block text-start">
							<li>MP4</li>
							<li>MOV</li>
							<li>WEBM</li>
							<li>MKV</li>
							<li>AVI</li>
							<li>GIF</li>
						</ul>
					</div>
				</div>
				<p className="text-center mt-3">
					<a href="https://github.com/Gierwont/EphemVid-frontend" target="_blank" rel="noopener noreferrer" className="btn btn-outline-success">
						<Image src={githubLogo} alt="GitHub Logo" className="align-middle me-2" />
						View project on GitHub
					</a>
				</p>
			</section>
		</Container>
	);
}

export default App;
