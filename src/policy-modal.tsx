import { useState, useEffect } from 'react';
import { Modal, Button, Form, Collapse } from 'react-bootstrap';
interface Props {
    showModal: boolean
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;

}
const PrivacyModal = (props: Props) => {
    const [checked, setChecked] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    useEffect(() => {
        const isAccepted = localStorage.getItem('terms_accepted') === 'true';
        if (isAccepted) { props.setShowModal(false) };
    }, []);

    const onAccept = () => {
        if (checked) {
            localStorage.setItem('terms_accepted', 'true');
            props.setShowModal(false);
        }

    }

    return (
        <Modal show={props.showModal} onHide={() => props.setShowModal(false)} centered contentClassName="bg-dark text-white">
            <Modal.Header>
                <Modal.Title>Welcome</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    This site uses strictly necessary cookies and technical identifiers to enable temporary video uploads and prevent abuse. Videos expire after 24 hours. Please read and accept our Privacy Policy and Terms of Service.
                </p>

                <Form.Group className="mb-3" controlId="privacyCheckbox">
                    <Form.Check
                        type="checkbox"
                        label="I accept the Privacy Policy and Terms of Service"
                        checked={checked}
                        onChange={() => setChecked(!checked)}

                    />
                </Form.Group>

                <div className="mb-2">
                    <Button
                        variant="link"
                        onClick={() => { setShowPrivacy(!showPrivacy); setShowTerms(false) }}
                        aria-controls="privacy-text"
                        aria-expanded={showPrivacy}
                        style={{
                            color: 'lightgreen',
                        }}
                    >
                        {showPrivacy ? "Hide Privacy Policy" : "Show Privacy Policy"}
                    </Button>

                    <Button
                        variant="link"
                        onClick={() => { setShowTerms(!showTerms); setShowPrivacy(false) }}
                        aria-controls="terms-text"
                        aria-expanded={showTerms}
                        style={{
                            color: 'lightgreen',
                        }}
                    >
                        {showTerms ? "Hide Terms of Service" : "Show Terms of Service"}
                    </Button>
                </div>

                <Collapse in={showPrivacy}>
                    <div id="privacy-text" className="mt-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        <pre style={{ whiteSpace: 'pre-wrap' }}>
                            {`Privacy Policy
This service allows users to upload, edit and download short-lived videos.
We are committed to protecting your privacy and keeping your data minimal.

Data We Collect
Cookies: We use two technical cookies (a session token and a technical identifier) to maintain a temporary user session and prevent abuse.
Device Fingerprinting: A limited fingerprint is generated to ensure fair use of storage.
Log Data: Standard server logs may include IP addresses and browser information, used only for security and troubleshooting.

Purpose of Data Use
All collected data is strictly necessary to:
- enable temporary uploads and edits of videos,
- ensure fair resource usage and prevent abuse,
- maintain the service functionality for up to 24 hours.

Data Retention
Uploaded videos, cookies, fingerprints and identifiers are automatically deleted within 24 hours.

Third Parties
We may use hosting or CDN providers (such as Cloudflare) to deliver the service.

Your Rights
Under applicable data protection laws (e.g. GDPR), you have the right to access, correct, or request deletion of your data.`}
                        </pre>
                    </div>
                </Collapse>

                <Collapse in={showTerms}>
                    <div id="terms-text" className="mt-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        <pre style={{ whiteSpace: 'pre-wrap' }}>
                            {`Terms of Service
1. Videos uploaded are temporary and will be deleted automatically after 24 hours.
2. Users are prohibited from uploading illegal, offensive, or abusive content.
3. No account registration is required; sessions are anonymous.
4. Users must not attempt to bypass storage limits or technical restrictions.
5. The service provider is not liable for content uploaded by users.
6. By using this service, you agree to comply with all applicable laws.`}
                        </pre>
                    </div>
                </Collapse>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="success"
                    disabled={!checked}
                    onClick={onAccept}
                >
                    Take me to the site
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PrivacyModal;
