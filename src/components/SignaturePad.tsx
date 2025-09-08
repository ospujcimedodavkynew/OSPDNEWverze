
import React, { useRef, useEffect } from 'react';
import { Button } from './ui';

interface SignaturePadProps {
    onSave: (dataUrl: string) => void;
    onCancel: () => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onCancel }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const isDrawing = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const context = canvas.getContext('2d');
        if (!context) return;
        
        context.lineCap = 'round';
        context.strokeStyle = 'black';
        context.lineWidth = 2;
        contextRef.current = context;
    }, []);

    const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current?.beginPath();
        contextRef.current?.moveTo(offsetX, offsetY);
        isDrawing.current = true;
    };

    const finishDrawing = () => {
        contextRef.current?.closePath();
        isDrawing.current = false;
    };

    const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing.current) return;
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current?.lineTo(offsetX, offsetY);
        contextRef.current?.stroke();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if (canvas && context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    };
    
    const handleSave = () => {
        const canvas = canvasRef.current;
        if(canvas) {
            onSave(canvas.toDataURL());
        }
    }

    return (
        <div className="border border-gray-400 rounded">
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={finishDrawing}
                onMouseMove={draw}
                onMouseLeave={finishDrawing}
                className="bg-white w-full h-48 rounded-t"
            />
            <div className="flex justify-end p-2 bg-gray-200 rounded-b space-x-2">
                <Button onClick={clearCanvas} className="bg-gray-500 hover:bg-gray-600">Vyčistit</Button>
                <Button onClick={onCancel} className="bg-red-500 hover:bg-red-600">Zrušit</Button>
                <Button onClick={handleSave}>Uložit podpis</Button>
            </div>
        </div>
    );
};

export default SignaturePad;
