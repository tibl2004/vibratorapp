import React, { useRef, useEffect, useState } from 'react';
import Modal from 'react-modal';
import './VibratorControl.scss'; // Import the SCSS file

Modal.setAppElement('#root'); // Set the app element for accessibility

const VibratorControl = () => {
  const canvasRef = useRef(null);
  const [modalIsOpen, setModalIsOpen] = useState(true); // Modal is open by default
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [points, setPoints] = useState([]);
  const [currentY, setCurrentY] = useState(200);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const centerX = canvas.width / 2;

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the central fixed point
      context.beginPath();
      context.arc(centerX, currentY, 5, 0, Math.PI * 2);
      context.fillStyle = 'red';
      context.fill();
      context.closePath();

      // Draw the rolling line
      context.beginPath();
      points.forEach(point => {
        context.lineTo(point.x + centerX, point.y);
      });
      context.strokeStyle = 'pink';
      context.lineWidth = 2;
      context.stroke();
      context.closePath();
    };

    draw();
  }, [points, currentY]);

  useEffect(() => {
    const movePoint = () => {
      setPoints(prevPoints => {
        const newPoints = prevPoints.map(point => ({ ...point, x: point.x - 1 })).filter(point => point.x + canvasRef.current.width / 2 > 0);
        return [{ x: 0, y: currentY }, ...newPoints];
      });
    };

    const interval = setInterval(movePoint, 10);
    return () => clearInterval(interval);
  }, [currentY]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (event) => {
    if (!isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    setCurrentY(event.clientY - rect.top);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const searchBluetoothDevices = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true
      });
      setDevices([...devices, device]);
    } catch (error) {
      console.error('Error accessing Bluetooth devices:', error);
    }
  };

  const handleConnectDevice = (device) => {
    // Logic to connect to the selected Bluetooth device can be added here
    setSelectedDevice(device);
    setModalIsOpen(false);
  };

  // Search for Bluetooth devices when the component mounts
  useEffect(() => {
    searchBluetoothDevices();
  }, []);

  return (
    <div className="vibrator-control">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Bluetooth Devices"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Available Bluetooth Devices</h2>
        <ul>
          {devices.map((device, index) => (
            <li key={index} onClick={() => handleConnectDevice(device)}>
              {device.name || `Device ${index + 1}`}
            </li>
          ))}
        </ul>
        {selectedDevice && (
          <p>Connected to: {selectedDevice.name || 'Unnamed Device'}</p>
        )}
        <button onClick={() => setModalIsOpen(false)}>Close</button>
      </Modal>

      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="vibrator-control__canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={(e) => handleMouseDown(e.touches[0])}
        onTouchMove={(e) => handleMouseMove(e.touches[0])}
        onTouchEnd={handleMouseUp}
      />
    </div>
  );
};

export default VibratorControl;
