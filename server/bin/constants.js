const genericPicture = '_generic.png';

const Sockets = {
	options: {
		path: '/_sockets/',
		cors: {
			origin: "http://node-server.local:3000",
			methods: ["GET", "POST"]
		}
    },
	handshake: {
		verb: 'handshake',
		message: 'Web Socket connection established.'
	},
	refresh: {
		verb: 'refresh',
		message: 'Data has been modified. Refresh data.'
	},
	smack: {
		verb: 'smack',
		message: 'New smack',
	},
};

const EmailSettings = {
	name:'Bowl Cup Administrator',
	account: 'bowlcuptournament',
	password: 'thecup99',
	server: 'smtp.gmail.com',
	SSL: true,
//	TLS: {
//		ciphers: 'SSLv3',
//	},
	TLS: false,
	port: 465,
	authentication:['PLAIN', 'LOGIN', 'XOAUTH2'],
	domain: 'gmail.com',
	destination: 'http://node-server.local:3000',
	header_image: 'email/umd.webp',
}

module.exports = {
	Sockets,
	EmailSettings,
	genericPicture,
}
