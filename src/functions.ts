import FingerprintJS from '@fingerprintjs/fingerprintjs';

export async function setFingerprintCookie() {
	const fp = await FingerprintJS.load();
	const result = await fp.get();
	document.cookie = `fingerprint=${result.visitorId}; path=/;max-age=${60 * 60 * 24}`;
}
