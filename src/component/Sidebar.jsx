import { BarChart2, Menu, Users, Mail, CalendarCheck, Atom } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

const SIDEBAR_ITEMS = [
	{ name: "Tổng quan",icon: BarChart2, color: "#6366f1", href: "/"	},
	{ name: "Người dùng", icon: Users, color: "#EC4899", href: "/users" },
	{ name: "Lịch hẹn tư vấn", icon: CalendarCheck, color: "#F59E0B", href: "/schedule" },
	{ name: "Bài viết", icon: Atom, color: "#000000", href: "/blogs" },
	{ name: "Thông báo", icon: Mail, color: "#E02AF4", href: "/fcm" },
];

const Sidebar = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	return (
		<motion.div
			style={{
				position: 'relative',
				zIndex: 10,
				transition: 'all 0.3s ease-out',
				flexShrink: 0,
				borderRadius:15,
				width: isSidebarOpen ? '256px' : '80px'
			}}
			animate={{ width: isSidebarOpen ? 256 : 80 }}
		>
			<div style={{
				height: '100%',
				backgroundColor: '#DEFFD3',
				backdropFilter: 'blur(10px)',
				padding: '16px',
				display: 'flex',
				flexDirection: 'column',
				borderRadius:5,
				borderRight: '1px solid rgba(107, 114, 128, 0.5)',
			}}>
				<motion.button
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					style={{
						padding: '8px',
						borderRadius: '9999px',
						transition: 'background-color 0.3s',
						maxWidth: '45px',
						maxHeight: '45px',
						cursor: 'pointer',
						backgroundColor:'#DEFFD3'
					}}
				>
					<Menu size={25} />
				</motion.button>

				<nav style={{ marginTop: '32px', flexGrow: 1 }}>
					{SIDEBAR_ITEMS.map((item) => (
						<Link key={item.href} to={item.href} style={{ textDecoration: 'none' }}>
							<motion.div style={{
								display: 'flex',
								alignItems: 'center',
								padding: '16px',
								fontSize: '14px',
								fontWeight: 500,
								borderRadius: '8px',
								borderWidth:10,
								transition: 'background-color 0.3s',
								marginBottom: '8px',
								cursor: 'pointer',
								':hover': {
									backgroundColor: 'rgba(107, 114, 128, 0.5)',
								}
							}}>
								<item.icon size={20} style={{ color: item.color, minWidth: '10px' }} />
								<AnimatePresence>
									{isSidebarOpen && (
										<motion.span
											style={{ marginLeft: '10px', whiteSpace: 'nowrap', color: item.color, fontSize:20, fontWeight:'bold', textDecoration:'none'  }}
											initial={{ opacity: 0, width: 0 }}
											animate={{ opacity: 1, width: 'auto' }}
											exit={{ opacity: 0, width: 0 }}
											transition={{ duration: 0.2, delay: 0.3 }}
										>
											{item.name}
										</motion.span>
									)}
								</AnimatePresence>
							</motion.div>
						</Link>
					))}
				</nav>
			</div>
		</motion.div>
	);
};
export default Sidebar;