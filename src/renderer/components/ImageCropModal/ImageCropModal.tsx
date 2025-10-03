import React, { useRef, useEffect, useState } from 'react';
import './ImageCropModal.css';

interface ImageCropModalProps {
	imageSrc: string;
	onClose: () => void;
	onCrop: (croppedDataUrl: string) => void;
}

const MAX_SIZE = 400;

const ImageCropModal: React.FC<ImageCropModalProps> = ({ imageSrc, onClose, onCrop }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [img, setImg] = useState<HTMLImageElement | null>(null);
	const [imgPos, setImgPos] = useState({ x: 0, y: 0 });
	const [dragging, setDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [imgStart, setImgStart] = useState({ x: 0, y: 0 });
	const [moveAxis, setMoveAxis] = useState<'x' | 'y' | 'both'>('both');
	const [scale, setScale] = useState(1);
	const [selectionSize, setSelectionSize] = useState(MAX_SIZE);

	// Cargar imagen y calcular escala
	useEffect(() => {
		const image = new window.Image();
		image.src = imageSrc;
		image.onload = () => {
			const size = Math.min(image.width, image.height, MAX_SIZE);
			setSelectionSize(size);
			let s;
			let axis: 'x' | 'y' | 'both';
			let pos = { x: 0, y: 0 };
			if (image.width > image.height) {
				s = size / image.height;
				axis = 'x';
				pos.x = -(image.width * s - size) / 2;
				pos.y = 0;
			} else if (image.height > image.width) {
				s = size / image.width;
				axis = 'y';
				pos.x = 0;
				pos.y = -(image.height * s - size) / 2;
			} else {
				s = size / image.width;
				axis = 'both';
				pos.x = 0;
				pos.y = 0;
			}
			setScale(s);
			setMoveAxis(axis);
			setImgPos(pos);
			setImg(image);
		};
	}, [imageSrc]);

	// Dibujar en canvas
	useEffect(() => {
		if (!img || !canvasRef.current) return;
		const ctx = canvasRef.current.getContext('2d');
		if (!ctx) return;
		ctx.clearRect(0, 0, selectionSize, selectionSize);
		ctx.save();
		ctx.drawImage(
			img,
			imgPos.x,
			imgPos.y,
			img.width * scale,
			img.height * scale
		);
		ctx.restore();
		// Oscurecer fuera del área de recorte
		ctx.save();
		ctx.globalCompositeOperation = 'destination-over';
		ctx.fillStyle = 'rgba(0,0,0,0.5)';
		ctx.fillRect(0, 0, selectionSize, selectionSize);
		ctx.restore();
		// Borde y esquinas
		ctx.save();
		ctx.strokeStyle = '#10b981';
		ctx.lineWidth = 3;
		ctx.strokeRect(0, 0, selectionSize, selectionSize);
		const cornerSize = 20;
		const cornerThickness = 4;
		ctx.strokeStyle = '#059669';
		ctx.lineWidth = cornerThickness;
		// Esquinas
		ctx.beginPath();
		ctx.moveTo(0, cornerSize);
		ctx.lineTo(0, 0);
		ctx.lineTo(cornerSize, 0);
		ctx.moveTo(selectionSize - cornerSize, 0);
		ctx.lineTo(selectionSize, 0);
		ctx.lineTo(selectionSize, cornerSize);
		ctx.moveTo(0, selectionSize - cornerSize);
		ctx.lineTo(0, selectionSize);
		ctx.lineTo(cornerSize, selectionSize);
		ctx.moveTo(selectionSize - cornerSize, selectionSize);
		ctx.lineTo(selectionSize, selectionSize);
		ctx.lineTo(selectionSize, selectionSize - cornerSize);
		ctx.stroke();
		ctx.restore();
	}, [img, imgPos, scale, selectionSize]);

	// Drag logic
	const startDrag = (x: number, y: number) => {
		setDragging(true);
		setDragStart({ x, y });
		setImgStart({ ...imgPos });
	};
	const moveDrag = (x: number, y: number) => {
		if (!dragging || !img) return;
		let dx = x - dragStart.x;
		let dy = y - dragStart.y;
		let newPos = { ...imgStart };
		if (moveAxis === 'x') {
			newPos.x = imgStart.x + dx;
			let minX = selectionSize - img.width * scale;
			let maxX = 0;
			newPos.x = Math.min(maxX, Math.max(newPos.x, minX));
		} else if (moveAxis === 'y') {
			newPos.y = imgStart.y + dy;
			let minY = selectionSize - img.height * scale;
			let maxY = 0;
			newPos.y = Math.min(maxY, Math.max(newPos.y, minY));
		} else {
			newPos.x = imgStart.x + dx;
			newPos.y = imgStart.y + dy;
			let minX = selectionSize - img.width * scale;
			let maxX = 0;
			let minY = selectionSize - img.height * scale;
			let maxY = 0;
			newPos.x = Math.min(maxX, Math.max(newPos.x, minX));
			newPos.y = Math.min(maxY, Math.max(newPos.y, minY));
		}
		setImgPos(newPos);
	};
	const endDrag = () => {
		setDragging(false);
	};

	// Mouse events
	const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
		startDrag(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
	};
	const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (dragging) moveDrag(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
	};
	const handleMouseUp = () => endDrag();
	const handleMouseLeave = () => endDrag();

	// Touch events
	const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
		if (e.touches.length === 1) {
			const rect = canvasRef.current!.getBoundingClientRect();
			const x = e.touches[0].clientX - rect.left;
			const y = e.touches[0].clientY - rect.top;
			startDrag(x, y);
		}
	};
	const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
		if (dragging && e.touches.length === 1) {
			const rect = canvasRef.current!.getBoundingClientRect();
			const x = e.touches[0].clientX - rect.left;
			const y = e.touches[0].clientY - rect.top;
			moveDrag(x, y);
		}
	};
	const handleTouchEnd = () => endDrag();
	const handleTouchCancel = () => endDrag();

	// Crop logic
	const handleCrop = () => {
		if (!img) return;
		const croppedCanvas = document.createElement('canvas');
		croppedCanvas.width = selectionSize;
		croppedCanvas.height = selectionSize;
		const croppedCtx = croppedCanvas.getContext('2d');
		if (!croppedCtx) return;
		let sx = -imgPos.x / scale;
		let sy = -imgPos.y / scale;
		let sw = selectionSize / scale;
		let sh = selectionSize / scale;
		croppedCtx.drawImage(
			img,
			sx,
			sy,
			sw,
			sh,
			0,
			0,
			selectionSize,
			selectionSize
		);
		const croppedDataURL = croppedCanvas.toDataURL('image/png', 1.0);
		onCrop(croppedDataURL);
		onClose();
	};

	// Keyboard support
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!img) return;
			const step = 5;
			let moved = false;
			let newPos = { ...imgPos };
			switch (e.key) {
				case 'Escape':
					onClose();
					break;
				case 'ArrowLeft':
					if (moveAxis === 'x' || moveAxis === 'both') {
						newPos.x = Math.min(0, newPos.x + step);
						moved = true;
					}
					break;
				case 'ArrowRight':
					if (moveAxis === 'x' || moveAxis === 'both') {
						const minX = selectionSize - img.width * scale;
						newPos.x = Math.max(minX, newPos.x - step);
						moved = true;
					}
					break;
				case 'ArrowUp':
					if (moveAxis === 'y' || moveAxis === 'both') {
						newPos.y = Math.min(0, newPos.y + step);
						moved = true;
					}
					break;
				case 'ArrowDown':
					if (moveAxis === 'y' || moveAxis === 'both') {
						const minY = selectionSize - img.height * scale;
						newPos.y = Math.max(minY, newPos.y - step);
						moved = true;
					}
					break;
			}
			if (moved) {
				setImgPos(newPos);
				e.preventDefault();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [img, imgPos, moveAxis, scale, selectionSize, onClose]);

	return (
		<div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description">
			<div className="image-editor-container">
				<header>
					<h2 id="modal-title">Recortar Imagen</h2>
					<p id="modal-description" className="subtext">
						Arrastra la imagen para posicionarla dentro del área de recorte.
					</p>
				</header>
				<main>
					<div className="canvas-container" role="img" aria-label="Área de edición de imagen">
						<canvas
							ref={canvasRef}
							width={selectionSize}
							height={selectionSize}
							tabIndex={0}
							aria-describedby="canvas-instructions"
							style={{ cursor: dragging ? 'grabbing' : 'grab' }}
							onMouseDown={handleMouseDown}
							onMouseMove={handleMouseMove}
							onMouseUp={handleMouseUp}
							onMouseLeave={handleMouseLeave}
							onTouchStart={handleTouchStart}
							onTouchMove={handleTouchMove}
							onTouchEnd={handleTouchEnd}
							onTouchCancel={handleTouchCancel}
						/>
						<div id="canvas-instructions" className="visually-hidden">
							Usa el mouse o toca para mover la imagen y seleccionar el área a recortar
						</div>
					</div>
					<div className="button-group">
						<button type="button" className="cancel-btn" onClick={onClose}>
							<svg className="button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
								<path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
							Cancelar
						</button>
						<button type="button" id="crop-btn" onClick={handleCrop}>
							<svg className="button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
								<path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
							Recortar
						</button>
					</div>
				</main>
			</div>
		</div>
	);
};

export default ImageCropModal;
