export const styles: { [key: string]: React.CSSProperties } = {
	container: {
		width: '100%',
		maxWidth: '900px',
		margin: '2rem auto',
		backgroundColor: '#ffffff',
		borderRadius: '8px',
		boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
		padding: '2rem',
		fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
		color: '#2c3e50'
	},
	header: {
		textAlign: 'center',
		color: '#34495e',
		marginBottom: '1.5rem',
		fontSize: '2rem'
	},
	form: {
		display: 'flex',
		flexDirection: 'column',
		marginBottom: '2rem',
		padding: '1rem',
		backgroundColor: '#f9f9f9',
		alignItems: 'center'
	},
	inputGroup: {
		marginBottom: '1.2rem',
		width: '100%'
	},
	label: {
		display: 'block',
		marginBottom: '0.5rem',
		color: '#34495e',
		fontWeight: '600'
	},
	input: {
		width: '100%',
		padding: '0.8rem',
		borderRadius: '4px',
		border: '1px solid #bdc3c7',
		fontSize: '1rem'
	},
	inputFile: {
		display: 'none'
	},
	buttonFile: {
		padding: '10px 20px',
		backgroundColor: '#007bff',
		color: 'white',
		border: 'none',
		borderRadius: '5px',
		cursor: 'pointer',
		fontSize: '16px',
		fontWeight: 'bold',
		transition: 'background-color 0.3s ease',
	},
	buttonFileHover: {
		backgroundColor: '#0056b3',
	},
	button: {
		width: '30%',
		padding: '0.8rem',
		backgroundColor: '#27ae60',
		color: '#fff',
		borderRadius: '4px',
		fontSize: '1rem',
		cursor: 'pointer',
		transition: 'background-color 0.3s',
	},
	disabledButton: {
		width: '30%',
		padding: '0.8rem',
		backgroundColor: '#27ae60',
		color: '#fff',
		borderRadius: '4px',
		fontSize: '1rem',
		opacity: 0.6,
		cursor: 'not-allowed'
	},
	tableTitle: {
		marginBottom: '1rem',
		textAlign: 'center',
		color: '#34495e',
		fontSize: '1.5rem'
	},
	table: {
		width: '100%',
		borderCollapse: 'collapse'
	},
	tableTh: {
		border: '1px solid #ecf0f1',
		padding: '0.75rem',
		backgroundColor: '#ecf0f1',
		color: '#34495e',
		textAlign: 'center'
	},
	tableTd: {
		border: '1px solid #ecf0f1',
		padding: '0.75rem',
		textAlign: 'center',
		height: '50px',
		verticalAlign: 'middle',
	},
	tableTr: {
		backgroundColor: '#fff',
		height: '50px',
	},
	indexTd: {
		border: '1px solid #ecf0f1',
		padding: '0.75rem',
		textAlign: 'center',
		color: '#2c3e50',
		fontWeight: 'bold'
	},
	link: {
		color: '#2980b9',
		textDecoration: 'none',
		fontWeight: '500'
	},
	image: {
		width: '100px',
		height: 'auto',
		borderRadius: '4px',
		objectFit: 'cover'
	},
	actionButton: {
		margin: '0 0.3rem',
		padding: '0.5rem 1rem',
		backgroundColor: 'transparent',
		border: 'none',
		borderRadius: '4px',
		color: '#fff',
		cursor: 'pointer',
	},
	loading: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		textAlign: 'center',
		marginTop: "50px"
	},
};