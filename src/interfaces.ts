export interface Video {
	id: number;
	filename: string;
	created_at: number;
	duration: number;
	size: number;
}

export interface editOptions {
	id: number;
	startTime?: number;
	endTime?: number;
	compressTo?: number;
	cropX?: number;
	cropY?: number;
	cropWidth?: number;
	cropHeight?: number;
}
