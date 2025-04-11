import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../style/NotFound.css";

const NotFound = () => {
    const [count, setCount] = useState(10);
    const [bloodHands, setBloodHands] = useState<{ id: number; x: number; y: number; rotation: number }[]>([]);
    const [showEye, setShowEye] = useState(false);

    const getRandomPosition = useCallback(() => {
        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
        };
    }, []);

    const addBloodHands = useCallback((number: number) => {
        const newHands = Array.from({ length: number }, (_, id) => {
            const { x, y } = getRandomPosition();
            return { id: bloodHands.length + id, x, y, rotation: Math.random() * 360 };
        });
        setBloodHands((prev) => [...prev, ...newHands]);
    }, [bloodHands, getRandomPosition]);

    useEffect(() => {
        if (count === 0) return;

        const interval = setInterval(() => {
            setCount((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [count]);

    useEffect(() => {
        const backgroundColors = [
            "#ffffff", "#e5e5e5", "#cccccc", "#b2b2b2", "#999999",
            "#7f7f7f", "#666666", "#4c4c4c", "#333333", "#191919", "#000000"
        ];

        document.body.style.background = backgroundColors[10 - count];

        if (count <= 10) {
            addBloodHands((10 - count) ** 2);
        }

        if (count === 0) {
            setShowEye(true);
        }
    }, [count, addBloodHands]);

    return (
        <div className="denied__wrapper">
            {!showEye ? (
                <div className="error-code">404</div>
            ) : (
                <img src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/fed6fe02-4491-4232-bcb3-6adba1e44507/dg6z1ox-8db67053-e1fb-4c29-9d72-86e4181ff16c.png/v1/fill/w_960,h_720/the_logo_horror_remake_eye__hd__by_chace1204_dg6z1ox-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NzIwIiwicGF0aCI6IlwvZlwvZmVkNmZlMDItNDQ5MS00MjMyLWJjYjMtNmFkYmExZTQ0NTA3XC9kZzZ6MW94LThkYjY3MDUzLWUxZmItNGMyOS05ZDcyLTg2ZTQxODFmZjE2Yy5wbmciLCJ3aWR0aCI6Ijw9OTYwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.XPu-dlcQi08dLEq1zKesQV4Zo6ZlIOGL4Ydc4M8mNy0" className="eye-image" alt="Eye" />
            )}
            <div className="countdown">{count}</div>
            <Link to="/">
                <button className={`escapeBtn ${count === 0 ? "halo" : ""}`}>
                    Chạy trốn
                </button>
            </Link>

            {bloodHands.map(({ id, x, y, rotation }) => (
                <img
                    key={id}
                    src="https://static.vecteezy.com/system/resources/thumbnails/030/341/652/small/handprints-on-transparent-background-png.png"
                    className="blood-hand"
                    style={{ left: `${x}px`, top: `${y}px`, transform: `rotate(${rotation}deg)` }}
                />
            ))}
        </div>
    );
};

export default NotFound;
