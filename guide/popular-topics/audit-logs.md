# Trabajar con Registros de Auditoría

## Un poco de contexto
Los registros de auditoría con una excelente herramienta de moderación ofrecida por Discord para saber qué pasó en un servidor y normalmente por quién. Por ahora, este es el único medio para ayudarte a determinar quién fue el ejecutor de cierta acción moderada. Eventos relevantes como `messageDelete` y `guildMemberLeave`, por desgracia, no brindan información sobre las acciones moderadas que los desencadenaron, haciendo la revisión de registros de auditoría necesarios.

Hay algunos casos en donde puedes usar registros de auditoría. Esta guía se limitará a los usos más comúnes. Ten la libertad de consultar la [página relevante de Discord API](https://discord.com/developers/docs/resources/audit-log), para más información.

::: warning ADVERTENCIA
Es crucial que primero entiendas dos detalles sobre registros de auditoría:
1) No está asegurado que lleguen cuando lo esperas (si en absoluto).
2) No hay evento desencadenado cuando un registro de auditoría es creado.
:::

Empecemos dándole un vistazo a la función `fetchAuditLogs` y cómo trabajar con él. Como muchas funciones discord.js, regresará una Promesa conteniendo el objeto GuildAuditLogs. En la mayoría de casos, sólo la propiedad `entries` será de interés, ya que mantiene una colección de objetos GuildAuditLogsEntry y, consecuentemente, la información que usualmente queremos. Siempre puedes ver las opciones <DocsLink path="class/Guild?scrollTo=fetchAuditLogs">en el documento discord.js </DocsLink>.

Los siguientes ejemplos explorarán un caso directo para algunos tipos de registro de auditoría. Algún error an la acción ocurre, pero estos segmentos de código son de todas formas a prueba de tontos y están para enseñarte cómo funciona la obtención de registros de auditoría. Probablemente necesitarás expandir los ejemplos basándote en tus propios objetivos para un sistema riguroso.

## ¿Quién eliminó un mensaje?
Uno de los casos más comunes para usar registros de auditoría sería entender quién eliminó cualquier mensaje enviado en un servidor de Discord.

::: warning ADVERTENCIA
Al tiempo en que se escribe esta guía, Discord no emite registros de auditoría si la persona que eliminó el mensaje es un bot eliminando un solo mensaje o si se trata del autor del mismo mensaje.
:::

Por ahora, nos centraremos en el evento `messageDelete`.

```js
client.on('messageDelete', message => {
	console.log(`A message by ${message.author.tag} was deleted, but we don't know by who yet.`);
});
```

Hasta ahora, nada debe parecer nuevo o complicado. Obtienes el evento de mensaje eliminado y el registro sobre un mensaje quitado de un canal. Más información sobre los objetos de mensaje se puede extraer, pero ese queda como un ejercicio para el lector.

Para simplificar, ajusta un límite de recuperación de 1 y acepta sólo el tipo `MESSAGE_DELETE`.

Al poner esto en el código anterior, obtendrás lo siguiente. Nota que esto también hace que la función async haga uso de `await`. Adicionalmene, asegúrate de ignorar mensajes directos.

```js {2-9,11-12,14-16,18-25}
client.on('messageDelete', async message => {
	// Ignora mensajes directos.
	if (!message.guild) return;
	const fetchedLogs = await message.guild.fetchAuditLogs({
		limit: 1,
		type: 'MESSAGE_DELETE',
	});
	// Ya que sólo hay una entrada de registro de auditoría en esta colección, obtén la primera
	const deletionLog = fetchedLogs.entries.first();

	// Realiza una revisión de coherencia para asegurarte que hay *algo*
	if (!deletionLog) return console.log(`A message by ${message.author.tag} was deleted, but no relevant audit logs were found.`);

	// Ahora obtén el objeto usuario de la persona que eliminó el mensaje
	// También obtén el objetivo de esta acción para estar dóblemente seguro
	const { executor, target } = deletionLog;

	// Actualiza la salida con un poco de información adicional
	// También ejecuta una revisión para asegurarte que el registro devuelto fue del mismo mensaje del autor
	if (target.id === message.author.id) {
		console.log(`A message by ${message.author.tag} was deleted by ${executor.tag}.`);
	} else {
		console.log(`A message by ${message.author.tag} was deleted, but we don't know by who.`);
	}
});
```

Con esto, ahora tienes un simple registrador diciéndote quién eliminó un mensaje de otra persona.

## ¿Quién expulsó a un miembro?

Similar la caso de `messageDelete`, veamos el evento de `guildMemberRemove`.

```js
client.on('guildMemberRemove', member => {
	console.log(`${member.user.tag} left the guild... but was it of their own free will?`);
});
```

Igual que antes: ajusta el límite de recuperación a 1 y acepta sólo el tipo `MEMBER_KICK`.

```js {2-7,9-10,12-14,16-22}
client.on('guildMemberRemove', async member => {
	const fetchedLogs = await member.guild.fetchAuditLogs({
		limit: 1,
		type: 'MEMBER_KICK',
	});
	// Ya que sólo hay una entrada de registro de auditoría en esta colección, obtén la primera
	const kickLog = fetchedLogs.entries.first();

	// Realiza una revisión de coherencia para asegurarte que hay *algo*
	if (!kickLog) return console.log(`${member.user.tag} left the guild, most likely of their own will.`);

	// Ahora obtén el objeto usuario de la persona que expulsó al miembro
	// También obtén el objetivo de esta acción para estar dóblemente seguro
	const { executor, target } = kickLog;

	// Actualiza la salida con un poco de información adicional
	// También ejecuta una revisión para asegurarte que el registro devuelto fue del mismo miembro expulsado
	if (target.id === member.id) {
		console.log(`${member.user.tag} left the guild; kicked by ${executor.tag}?`);
	} else {
		console.log(`${member.user.tag} left the guild, audit log fetch was inconclusive.`);
	}
});
```

## ¿Quién baneó a un usario?

La lógica para esto será muy similar al ejemplo de expulsión de arriba, excepto que esta vez, el evento `guildBanAdd`será usado.

```js
client.on('guildBanAdd', async (guild, user) => {
	console.log(`${user.tag} got hit with the swift hammer of justice in the guild ${guild.name}.`);
});
```

Como fue el caso en ejemplos anteriores, puedes ver qué pasó, a quién le pasó, pero no el ejecutor de la acción. Otra vez ingresa el límite de recuperación a 1 y sólo el tipo `MEMBER_BAN_ADD`. El "escuchador" `guildBanAdd` será:

```js {2-7,9-10,12-14,16-22}
client.on('guildBanAdd', async (guild, user) => {
	const fetchedLogs = await guild.fetchAuditLogs({
		limit: 1,
		type: 'MEMBER_BAN_ADD',
	});
	// Ya que sólo hay una entrada de registro de auditoría en esta colección, obtén la primera
	const banLog = fetchedLogs.entries.first();

	// Realiza una revisión de coherencia para asegurarte que hay *algo*
	if (!banLog) return console.log(`${user.tag} was banned from ${guild.name} but no audit log could be found.`);

	// Ahora obtén el objeto usuario de la persona que baneó al miembro
	// También obtén el objetivo de esta acción para estar dóblemente seguro
	const { executor, target } = banLog;

	// Actualiza la salida con un poco de información adicional
	// También ejecuta una revisión para asegurarte que el registro devuelto fue del mismo miembro baneado
	if (target.id === user.id) {
		console.log(`${user.tag} got hit with the swift hammer of justice in the guild ${guild.name}, wielded by the mighty ${executor.tag}`);
	} else {
		console.log(`${user.tag} got hit with the swift hammer of justice in the guild ${guild.name}, audit log fetch was inconclusive.`);
	}
});
```
