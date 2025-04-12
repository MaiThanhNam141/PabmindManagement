import { useEffect, useRef, useState } from 'react';
import { animate, stagger, utils } from 'animejs';
import { Button, Typography, Space, Card } from 'antd';
import { HomeOutlined, RollbackOutlined } from '@ant-design/icons';
import '../style/NotFound.css';

const { Title, Text } = Typography;

const ABSTRACT_SHAPES = [
    () => 'polygon(50% 0%, 0% 100%, 100% 100%)',
    () => 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    () => 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    () => 'circle(50% at 50% 50%)',
];

const generateColor = () =>
    `hsla(${Math.random() * 360}, 80%, 60%, ${Math.random() * 0.4 + 0.1})`;

const generateStyle = (color: string, type: number): Partial<CSSStyleDeclaration> => {
    const base = {
        position: 'absolute',
        width: `${Math.random() * 150 + 50}px`,
        height: `${Math.random() * 150 + 50}px`,
        opacity: '0',
        pointerEvents: 'none',
        mixBlendMode: 'exclusion',
        filter: 'blur(10px)',
    };

    switch (type) {
        case 0:
            return {
                ...base,
                borderRadius: `${Math.random() * 100}%`,
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            };
        case 1:
            return {
                ...base,
                clipPath: ABSTRACT_SHAPES[0](),
                background: color,
            };
        case 2:
            return {
                ...base,
                borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                background: `linear-gradient(45deg, ${color}, transparent)`,
            };
        case 3:
        default:
            return {
                ...base,
                clipPath: ABSTRACT_SHAPES[2](),
                background: color,
            };
    }
};

const useWindowDimensions = () => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const update = () => setDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
        });

        window.addEventListener('resize', update);
        update();

        return () => window.removeEventListener('resize', update);
    }, []);

    return dimensions;
};

const useAbstractAnimation = (containerRef: React.RefObject<HTMLDivElement | null>, dimensions: { width: number, height: number }) => {
    const animationRefs = useRef<ReturnType<typeof animate>[]>([]);

    useEffect(() => {
        const container = containerRef.current;
        const currentContainer = containerRef.current; // Copy ref value to a variable
        if (!container || dimensions.width === 0 || dimensions.height === 0) return;

        // Cleanup before re-init
        animationRefs.current.forEach(anim => anim.pause());
        animationRefs.current = [];
        container.querySelectorAll('.abstract-particle').forEach(el => el.remove());

        const createShape = () => {
            const type = Math.floor(Math.random() * 4);
            const color = generateColor();
            const shape = document.createElement('div');
            shape.className = 'abstract-particle';
            Object.assign(shape.style, generateStyle(color, type));
            containerRef.current!.appendChild(shape);
            return shape;
        };

        const shapes = Array.from({ length: 15 }, createShape).map((shape, i) => {
            shape.style.transform = `translate(${Math.random() * dimensions.width}px, ${Math.random() * dimensions.height}px)`;
            shape.style.opacity = '1';
            shape.style.zIndex = `${i}`;
            return shape;
        });

        const floatingAnim = animate({
            targets: shapes,
            translateX: () => Math.random() * dimensions.width * 0.8 - dimensions.width * 0.4,
            translateY: () => Math.random() * dimensions.height * 0.8 - dimensions.height * 0.4,
            rotate: () => utils.random(-360, 360),
            scale: () => [0, utils.random(0.5, 1.5)],
            opacity: () => [0, utils.random(0.2, 0.6)],
            duration: () => utils.random(5000, 10000),
            delay: stagger(500, { from: 'center' }),
            easing: 'easeInOutSine',
            loop: true,
            direction: 'alternate',
            update: () => {
                shapes.forEach(shape => {
                    shape.style.filter = `blur(${Math.random() * 15}px) hue-rotate(${Math.random() * 360}deg)`;
                });
            },
        }, {});

        const morphingAnim = animate({
            targets: shapes,
            borderRadius: () => [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            clipPath: () => {
                const from = ABSTRACT_SHAPES[Math.floor(Math.random() * ABSTRACT_SHAPES.length)]();
                const to = ABSTRACT_SHAPES[Math.floor(Math.random() * ABSTRACT_SHAPES.length)]();
                return [from, to];
            },
            duration: () => utils.random(8000, 15000),
            easing: 'easeInOutQuad',
            loop: true,
            direction: 'alternate',
        }, {});

        const card = containerRef.current?.querySelector('.main-card');
        if (card) {
            animate({
                targets: card,
                opacity: [0, 1],
                translateY: [50, 0],
                scale: [0.9, 1],
                easing: 'easeOutExpo',
                duration: 1000,
                delay: 500,
            }, {});
        }

        animationRefs.current = [floatingAnim, morphingAnim];

        // Cursor Trail Setup
        const trailContainer = document.createElement('div');
        Object.assign(trailContainer.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: '999',
        });
        containerRef.current?.appendChild(trailContainer);

        const trailPool: HTMLDivElement[] = [];
        const maxTrails = 20;
        let lastTrailTime = 0;

        const handleMouseMove = (e: MouseEvent) => {
            const now = performance.now();
            if (now - lastTrailTime < 30) return; // ~33fps
            lastTrailTime = now;

            let trail: HTMLDivElement;
            if (trailPool.length < maxTrails) {
                trail = document.createElement('div');
                trail.className = 'cursor-trail';
                Object.assign(trail.style, {
                    position: 'absolute',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    mixBlendMode: 'screen',
                });
                trailContainer.appendChild(trail);
                trailPool.push(trail);
            } else {
                trail = trailPool.shift()!;
                trailPool.push(trail);
            }

            const baseSize = 20 + Math.random() * 10;
            const left = e.clientX - baseSize / 2;
            const top = e.clientY - baseSize / 2;
            const hue = Math.floor(Math.random() * 360);
            const blur = 8 + Math.random() * 8;

            Object.assign(trail.style, {
                left: `${left}px`,
                top: `${top}px`,
                width: `${baseSize}px`,
                height: `${baseSize}px`,
                background: `hsla(${hue}, 100%, 70%, 0.3)`,
                filter: `blur(${blur}px)`,
                opacity: '0.7',
                transform: 'scale(1)',
                zIndex: '10',
            });

            animate({
                targets: trail,
                scale: [1, 2],
                opacity: [0.7, 0],
                duration: 800,
                easing: 'easeOutQuad',
                complete: () => {
                    trail.style.opacity = '0';
                }
            }, {});
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Cleanup
        return () => {
            animationRefs.current.forEach(anim => anim.pause());
            animationRefs.current = [];
            window.removeEventListener('mousemove', handleMouseMove);
            currentContainer?.querySelectorAll('.abstract-particle').forEach(el => el.remove());
            containerRef.current?.querySelectorAll('.abstract-particle').forEach(el => el.remove());
        };
    }, [dimensions, containerRef]);

};

const NotFound = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const dimensions = useWindowDimensions();
    useAbstractAnimation(containerRef, dimensions);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '98vw',
                height: '97vh',
                background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
                overflow: 'hidden',
            }}
        >
            <div className="animated-background" />
            <Card
                className="main-card"
                bordered={false}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    maxWidth: '600px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 45px rgba(0, 0, 0, 0.2)',
                    zIndex: 1000,
                    opacity: 1,
                    padding: '40px',
                    textAlign: 'center'
                }}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Title
                        level={1}
                        style={{
                            fontSize: '8rem',
                            margin: 0,
                            color: 'transparent',
                            background: 'linear-gradient(45deg, #ff4d4f, #1890ff, #13c2c2, #722ed1)',
                            WebkitBackgroundClip: 'text',
                            backgroundSize: '300% 300%',
                            animation: 'gradient 6s ease infinite',
                            fontWeight: 800,
                            letterSpacing: '-5px',
                        }}
                    >
                        404
                    </Title>
                    <Text
                        style={{
                            fontSize: '1.5rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontStyle: 'italic',
                            fontFamily: "'Courier New', monospace",
                        }}
                    >
                        Reality distorted. Path undefined. Existence uncertain.
                    </Text>
                    <Space wrap style={{ justifyContent: 'center', marginTop: '30px' }}>
                        <Button
                            type="primary"
                            shape="round"
                            icon={<HomeOutlined />}
                            size="large"
                            onClick={() => window.location.href = '/'}
                            style={{
                                padding: '0 35px',
                                height: '50px',
                                background: 'linear-gradient(45deg, #ff4d4f, #722ed1)',
                                border: 'none',
                                fontWeight: 'bold',
                            }}
                        >
                            Reconstruct Reality
                        </Button>
                        <Button
                            type="text"
                            shape="round"
                            icon={<RollbackOutlined />}
                            size="large"
                            onClick={() => window.history.back()}
                            style={{
                                padding: '0 35px',
                                height: '50px',
                                color: '#13c2c2',
                                fontWeight: 'bold',
                            }}
                        >
                            Retrace Steps
                        </Button>
                    </Space>
                </Space>
            </Card>
        </div>
    );
};

export default NotFound;
