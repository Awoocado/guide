# ¡Comenzando con el "OAuth2"!

OAuth2 permite a los desarrolladores de aplicaciones crear aplicaciones que utilizan autenticación y datos de la API de Discord. Los desarrolladores pueden usar esto para crear cosas como paneles web para mostrar información del usuario, obtener cuentas de terceros vinculadas como Twitch o Steam, acceder a la información del gremio de los usuarios sin estar realmente en el gremio, y mucho más. OAuth2 puede ampliar significativamente la funcionalidad de su bot si se usa correctamente.

## Hagamos un rápido ejemplo

### Formando un Web Server (WS) básico

La mayoría de las veces, los sitios web utilizan OAuth2 para obtener información sobre sus usuarios de un servicio externo. En este ejemplo, usaremos [`express`](https://expressjs.com/) para crear dicho server para usar la información de un usuario en discord. Comienza creando 3 archivos: `config.json`, `index.js`, y `index.html`. 

`config.json` se usará para guardar variables, como el ClientID, port, entre otros...

```json
{
	"clientId": "",
	"clientSecret": "",
	"port": 53134
}
```

`index.js` se usará para encender el servidor y recibir "requests". Cuando alguien visita la página index (`/`), un archivo HTML será enviado como respuesta.

```js
const express = require('express');
const { port } = require('./config.json');

const app = express();

app.get('/', (req, res) => { //req = response && res = response.
	return res.sendFile('index.html', { root: '.' });
});

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
```

`index.html` se usará para mostrar la información cargada.

```html
<!DOCTYPE html>
<html>
<head>
	<title>My Discord OAuth2 App</title>
</head>
<body>
	<div id="info">
		¡Hola!
	</div>
</body>
</html>
```

Después de ejecutar `npm i express`, puedes arrancar tu servidor con el comando `node index.js`. Una vez hecho, conéctate a el link `http://localhost:53134`, y verás "¡Hola!".

::: tip
Aunque usamos ahora ExpressJs, hay muchas otras alternativas de ejecutar un Web Server, dichas son: [Fastify](https://www.fastify.io/), [Koa](https://koajs.com/), y el [native Node.js http module](https://nodejs.org/api/http.html).
:::

### Obtener una URL OAuth2

Bien, ahora que tienes tu servidor "vivito y coleando", es hora de obtener una rica información de Discord. Abre [tus aplicaciones](https://discord.com/developers/applications/), crea o selecciona una aplicación y dirígete a la página "OAuth2".

![Página OAuth2](./images/oauth2-app-page.png)

Toma nota sobre el `client id` y el `client secret`. Copia ambos valores y pégalos en tu `config.json`; son necesarios para luego. Por ahora, añade una URL de redirección a `http://localhost:53134`:

![Añadiendo redirecciones](./images/add-redirects.png)

Una vez que añadas tu URL de redirección, querrás generar una OAuth2 URL. Baja un poquito en la misma página y... ¡Oh, ahí está! El generador de OAuth2 URLs proveido por Discord. Usa esta herramienta para generar una URL, asegurate de marcar la casilla `identify`, esta es **MUY** necesaria.

![Generate an OAuth2 URL](./images/generate-url.png)

The `identify` scope will allow your application to get basic user information from Discord. You can find a list of all scopes [here](https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes).

### Implicit grant flow

You have your website, and you have a URL. Now you need to use those two things to get an access token. For basic applications like [SPAs](https://en.wikipedia.org/wiki/Single-page_application), getting an access token directly is enough. You can do so by changing the `response_type` in the URL to `token`. However, this means you will not get a refresh token, which means the user will have to explicitly re-authorize when this access token has expired.

After you change the `response_type`, you can test the URL right away. Visiting it in your browser, you will be directed to a page that looks like this:

![Authorization Page](./images/authorize-app-page.png)

You can see that by clicking `Authorize`, you allow the application to access your username and avatar. Once you click through, it will redirect you to your redirect URL with a [fragment identifier](https://en.wikipedia.org/wiki/Fragment_identifier) appended to it. You now have an access token and can make requests to Discord's API to get information on the user.

Modify `index.html` to add your OAuth2 URL and to take advantage of the access token if it exists. Even though [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) is for working with query strings, it can work here because the structure of the fragment follows that of a query string after removing the leading "#".

```html {4-26}
<div id="info">
	Hoi!
</div>
<a id="login" style="display: none;" href="your-oauth2-URL-here">Identify Yourself</a>
<script>
	window.onload = () => {
		const fragment = new URLSearchParams(window.location.hash.slice(1));
		const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];

		if (!accessToken) {
			return document.getElementById('login').style.display = 'block';
		}

		fetch('https://discord.com/api/users/@me', {
			headers: {
				authorization: `${tokenType} ${accessToken}`,
			},
		})
			.then(result => result.json())
			.then(response => {
				const { username, discriminator } = response;
				document.getElementById('info').innerText += ` ${username}#${discriminator}`;
			})
			.catch(console.error);
	};
</script>
```

Here you grab the access token and type from the URL if it's there and use it to get info on the user, which is then used to greet them. The response you get from the [`/api/users/@me` endpoint](https://discord.com/developers/docs/resources/user#get-current-user) is a [user object](https://discord.com/developers/docs/resources/user#user-object) and should look something like this:

```json
{
	"id": "123456789012345678",
	"username": "User",
	"discriminator": "0001",
	"avatar": "1cc0a3b14aec3499632225c708451d67",
	...
}
```

In the following sections, we'll go over various details of Discord and OAuth2.

## More details

### The state parameter

OAuth2's protocols provide a `state` parameter, which Discord supports. This parameter helps prevent [CSRF](https://en.wikipedia.org/wiki/Cross-site_request_forgery) attacks and represents your application's state. The state should be generated per user and appended to the OAuth2 URL. For a basic example, you can use a randomly generated string encoded in Base64 as the state parameter.

```js {1-10,15-18}
function generateRandomString() {
	let randomString = '';
	const randomNumber = Math.floor(Math.random() * 10);

	for (let i = 0; i < 20 + randomNumber; i++) {
		randomString += String.fromCharCode(33 + Math.floor(Math.random() * 94));
	}

	return randomString;
}

window.onload = () => {
	// ...
	if (!accessToken) {
		const randomString = generateRandomString();
		localStorage.setItem('oauth-state', randomString);

		document.getElementById('login').href += `&state=${btoa(randomString)}`;
		return document.getElementById('login').style.display = 'block';
	}
};
```

When you visit a URL with a `state` parameter appended to it and then click `Authorize`, you'll notice that after being redirected, the URL will also have the `state` parameter appended, which you should then check against what was stored. You can modify the script in your `index.html` file to handle this.

```js {2,8-10}
const fragment = new URLSearchParams(window.location.hash.slice(1));
const [accessToken, tokenType, state] = [fragment.get('access_token'), fragment.get('token_type'), fragment.get('state')];

if (!accessToken) {
	// ...
}

if (localStorage.getItem('oauth-state') !== atob(decodeURIComponent(state))) {
	return console.log('You may have been clickjacked!');
}
```

::: tip
Don't forgo security for a tiny bit of convenience!
:::

### Authorization code grant flow

What you did in the quick example was go through the `implicit grant` flow, which passed the access token straight to the user's browser. This flow is great and simple, but you don't get to refresh the token without the user, and it is less secure than going through the `authorization code grant` flow. This flow involves receiving an access code, which your server then exchanges for an access token. Notice that this way, the access token never actually reaches the user throughout the process.

Unlike the [implicit grant flow](/oauth2/#implicit-grant-flow), you need an OAuth2 URL where the `response_type` is `code`. After you change the `response_type`, try visiting the link and authorizing your application. You should notice that instead of a hash, the redirect URL now has a single query parameter appended to it, i.e. `?code=ACCESS_CODE`. Modify your `index.js` file to access the parameter from the URL if it exists. In express, you can use the `request` parameter's `query` property.

```js {2}
app.get('/', (request, response) => {
	console.log(`The access code is: ${request.query.code}`);
	return response.sendFile('index.html', { root: '.' });
});
```

Now you have to exchange this code with Discord for an access token. To do this, you need your `client_id` and `client_secret`. If you've forgotten these, head over to [your applications](https://discord.com/developers/applications) and get them. You can use [`node-fetch`](https://www.npmjs.com/package/node-fetch) to make requests to Discord; you can install it with `npm i node-fetch`.

Require `node-fetch` and make your request.

```js {1,3,7-8,10-34}
const fetch = require('node-fetch');
const express = require('express');
const { clientId, clientSecret, port } = require('./config.json');

const app = express();

app.get('/', async ({ query }, response) => {
	const { code } = query;

	if (code) {
		try {
			const oauthResult = await fetch('https://discord.com/api/oauth2/token', {
				method: 'POST',
				body: new URLSearchParams({
					client_id: clientId,
					client_secret: clientSecret,
					code,
					grant_type: 'authorization_code',
					redirect_uri: `http://localhost:${port}`,
					scope: 'identify',
				}),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});

			const oauthData = await oauthResult.json();
			console.log(oauthData);
		} catch (error) {
			// NOTE: An unauthorized token will not throw an error;
			// it will return a 401 Unauthorized response in the try block above
			console.error(error);
		}
	}

	return response.sendFile('index.html', { root: '.' });
});
```

::: warning ADVERTENCIA
The content-type for the token URL must be `application/x-www-form-urlencoded`, which is why `URLSearchParams` is used.
:::

Now try visiting your OAuth2 URL and authorizing your application. Once you're redirected, you should see an [access token response](https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-access-token-response) in your console.

```json
{
	"access_token": "an access token",
	"token_type": "Bearer",
	"expires_in": 604800,
	"refresh_token": "a refresh token",
	"scope": "identify"
}
```

With an access token and a refresh token, you can once again use the [`/api/users/@me` endpoint](https://discord.com/developers/docs/resources/user#get-current-user) to fetch the [user object](https://discord.com/developers/docs/resources/user#user-object).

<!-- eslint-skip -->
```js {3-7,9}
const oauthData = await oauthResult.json();

const userResult = await fetch('https://discord.com/api/users/@me', {
	headers: {
		authorization: `${oauthData.token_type} ${oauthData.access_token}`,
	},
});

console.log(await userResult.json());
```

::: tip
To maintain security, store the access token server-side but associate it with a session ID that you generate for the user.
:::

## Additional reading

[RFC 6759](https://tools.ietf.org/html/rfc6749)  
[Discord Docs for OAuth2](https://discord.com/developers/docs/topics/oauth2)

## Resulting code

<ResultingCode path="oauth/simple-oauth-webserver" />
