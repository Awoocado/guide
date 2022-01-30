export default {
	'/voz/': [
		{
			text: 'Inicio',
			children: [
				'/',
				'/inicio/solicitando-mas-contenido.md',
				'/inicio/que-hay-de-nuevo.md',
			],
		},
		{
			text: '¿Cómo empezar?',
			children: [
				'/voz/',
			],
		},
		{
			text: 'Librería',
			children: [
				'/voz/ciclos-de-vida.md',
				'/voz/conexiones-de-voz.md',
				'/voz/reproductor-de-audio.md',
				'/voz/recursos-de-audio.md',
			],
		},
	],
	'/': [
		{
			text: 'Inicio',
			children: [
				'/',
				'/inicio/solicitando-mas-contenido.md',
				'/inicio/que-hay-de-nuevo.md',
			],
		},
		{
			text: 'Preparaciones',
			children: [
				'/preparaciones/instalación-de-nodejs-y-discordjs.md',
				'/preparaciones/configurando-una-app-bot.md',
				'/preparaciones/agregando-tu-bot-a-servidores.md',
			],
		},
		{
			text: 'Creando tu bot',
			children: [
				'/creando-tu-bot/poniendo-en-marcha-tu-bot.md',
				'/creando-tu-bot/archivos-de-configuracion.md',
				'/creando-tu-bot/agregando-mas-comandos.md',
			],
		},
		{
			text: 'Interacciones',
			children: [
				'/interacciones/registrando-comandos-de-barra.md',
				'/interacciones/respondiendo-a-comandos-de-barra.md',
				'/interacciones/permisos-de-comandos-de-barra.md',
				'/interacciones/botones.md',
				'/interacciones/select-menus.md',
			],
		},
		{
			text: 'Usando Gestores',
			children: [
				'/usando-gestores/gestor-de-interacciones.md',
				'/usando-gestores/gestor-de-eventos.md',
				'/usando-gestores/gestor-de-componentes.md',
				'/usando-gestores/gestor-de-comandos.md',
			],
		},
		{
			text: 'Temas populares',
			children: [
				'/temas-populares/faq.md',
				'/temas-populares/hilos.md',
				'/temas-populares/incrustaciones.md',
				'/temas-populares/constructores.md',
				'/temas-populares/reacciones.md',
				'/temas-populares/recolectores.md',
				'/temas-populares/permisos.md',
				'/temas-populares/permisos-extendidos.md',
				'/temas-populares/intents.md',
				'/temas-populares/parciales.md',
				'/temas-populares/webhooks.md',
				'/temas-populares/errores.md',
				'/temas-populares/registro-de-auditoria.md',
			],
		},
		{
			text: 'Misceláneo',
			children: [
				'/miscelaneo/analizar-argumentos-de-mencion.md',
				'/miscelaneo/paquetes-utiles.md',
				'/miscelaneo/rest-api.md',
				'/miscelaneo/canvas.md',
			],
		},
		{
			text:'Bases de datos',
			children: [
				'/bases-de-datos/introduccion.md',
				'/bases-de-datos/manejando-mongodb.md',
				'/bases-de-datos/manejando-mysql.md',
				'/bases-de-datos/manejando-redis.md',
				'/bases-de-datos/manejando-megadb.md',
			]
		},
		{
			text: 'Mejorando tu entorno de desarrollo',
			children: [
				'/mejorando-el-entorno-de-desarrollo/configurando-un-linter.md',
				'/mejorando-el-entorno-de-desarrollo/pm2.md',
				'/mejorando-el-entorno-de-desarrollo/package-json-scripts.md',
			],
		},
		{
			text: 'Fragmentación (Sharding)',
			children: [
				'/sharding/getting-started.md',
				'/sharding/informacion-adicional.md',
				'/sharding/extendido.md',
			],
		},
		{
			text: 'OAuth2',
			children: [
				'/oauth2/empezando-con-oauth2.md',
			],
		},
		{
			text: 'Información adicional',
			children: [
				'/informacion-adicional/notacion.md',
				'/informacion-adicional/sintaxis-es6.md',
				'/informacion-adicional/async-await.md',
				'/informacion-adicional/colecciones.md',
				'/informacion-adicional/cambios-en-v13.md',
				'/informacion-adicional/message-content-intent.md',
			],
		},
	],
};
