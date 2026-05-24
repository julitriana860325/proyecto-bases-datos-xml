# Proyecto Bases de Datos XML

Aplicación educativa local para aprender y practicar:
- XML
- XSD
- XPath
- XQuery

## Estructura del proyecto

```
PROYECTO BASES DE DATOS XML/
├── web/                  # Aplicación web local
│   ├── index.html        # Interfaz principal
│   ├── app.js            # Lógica de la aplicación
│   └── style.css         # Estilos visuales
├── xml/                  # Datos XML y esquema XSD
│   ├── data_valid.xml
│   ├── data_invalid.xml
│   └── schema.xsd
├── sql/                  # Consultas SQL/XML de ejemplo
│   ├── query.sql
│   └── registration.sql
```

## Cómo usar

1. Abre el archivo `web/index.html` en un navegador moderno.
2. Navega entre las secciones.
3. En el paso de XPath/XQuery se ejecuta localmente dentro del navegador.

## Notas

- No se requiere servidor ni BaseX.
- La aplicación funciona directamente con archivos locales.
- Si quieres, puedes usar una extensión como Live Server en VS Code para abrir `web/index.html`.
