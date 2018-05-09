# concurrency


EDICION CONCURRENTE:
--------------------

Se trata de dar la habilidad de editar una información 
por varias personas al mismo tiempo, en tiempo real a 
través de internet. De modo similar a como se hace en Drive Docs.

Para ello se usa simplemente JavaScript y el servicio proporcionado
por la web FanOut (https://fanout.io/), que envía los cambios de 
edición a las diferentes páginas web donde se está editando
en tiempo real.

En el ejemplo de Fanout, el texto se envía al resto de vistas de la página
sin necesidad de ser actualizadas.

---- 

MODIFICACIÓN

En nuestro caso, CADA VEZ QUE SE PULSE UNA TECLA (letras, borrado, intro, etc) 
se envíarán todo el contenido modificado al resto de páginas de edición.

A continuación, se guarda el contenido en un JSON para persistirlo.

De esta manera, cada editor (vista de la página) obtendrá los cambios en tiempo real
y se guardarán de forma automática para que no se pierda ningún cambio 
y no sea necesario guardar cambios.

URL DE PRUEBA:

https://concurrency.s3-eu-west-1.amazonaws.com/index.html

REPO: 
	
https://github.com/beeva-carlosmanuel/concurrency