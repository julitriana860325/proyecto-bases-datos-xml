// ============================================================================
// LÓGICA DE CONTROL: PLATAFORMA INTERACTIVA XML & ORACLE (7 TABLAS HR)
// ============================================================================

// 1. CÓDIGO FUENTE INCORPORADO (Mantener en sincronía con los archivos físicos)

const SQL_QUERY_CODE = `-- Consulta SQL/XML para combinar las 7 tablas del esquema HR en Oracle
SELECT XMLSERIALIZE(DOCUMENT
  XMLELEMENT("Corporacion",
    XMLELEMENT("Regiones",
      (
        SELECT XMLAGG(
          XMLELEMENT("Region",
            XMLATTRIBUTES(r.region_id AS "id", r.region_name AS "nombre"),
            XMLELEMENT("Paises",
              (
                SELECT XMLAGG(
                  XMLELEMENT("Pais",
                    XMLATTRIBUTES(c.country_id AS "id", c.country_name AS "nombre"),
                    XMLELEMENT("Localizaciones",
                      (
                        SELECT XMLAGG(
                          XMLELEMENT("Localizacion",
                            XMLATTRIBUTES(l.location_id AS "id"),
                            XMLFOREST(
                              l.street_address AS "Direccion",
                              l.postal_code AS "CodigoPostal",
                              l.city AS "Ciudad",
                              l.state_province AS "Provincia"
                            ),
                            XMLELEMENT("Departamentos",
                              (
                                SELECT XMLAGG(
                                  XMLELEMENT("Departamento",
                                    XMLATTRIBUTES(d.department_id AS "id", d.department_name AS "nombre"),
                                    XMLELEMENT("Empleados",
                                      (
                                        SELECT XMLAGG(
                                          XMLELEMENT("Empleado",
                                            XMLATTRIBUTES(e.employee_id AS "id"),
                                            XMLFOREST(
                                              e.first_name AS "Nombre",
                                              e.last_name AS "Apellido",
                                              e.email AS "Correo",
                                              e.phone_number AS "Telefono",
                                              TO_CHAR(e.hire_date, 'YYYY-MM-DD') AS "FechaContratacion",
                                              e.salary AS "Salario",
                                              e.commission_pct AS "Comision"
                                            ),
                                            XMLELEMENT("TrabajoActual",
                                              XMLATTRIBUTES(j.job_id AS "id", j.job_title AS "titulo"),
                                              XMLFOREST(
                                                j.min_salary AS "SalarioMinimo",
                                                j.max_salary AS "SalarioMaximo"
                                              )
                                            ),
                                            CASE 
                                              WHEN (SELECT COUNT(*) FROM job_history jh WHERE jh.employee_id = e.employee_id) > 0 THEN
                                                XMLELEMENT("HistorialLaboral",
                                                  (
                                                    SELECT XMLAGG(
                                                      XMLELEMENT("Historial",
                                                        XMLFOREST(
                                                          TO_CHAR(jh.start_date, 'YYYY-MM-DD') AS "FechaInicio",
                                                          TO_CHAR(jh.end_date, 'YYYY-MM-DD') AS "FechaFin",
                                                          jh.job_id AS "IdTrabajo",
                                                          jh.department_id AS "IdDepartamento"
                                                        )
                                                      )
                                                    )
                                                    FROM job_history jh
                                                    WHERE jh.employee_id = e.employee_id
                                                  )
                                                )
                                              ELSE NULL
                                            END
                                          )
                                        )
                                        FROM employees e
                                        JOIN jobs j ON e.job_id = j.job_id
                                        WHERE e.department_id = d.department_id
                                      )
                                    )
                                  )
                                )
                                FROM departments d
                                WHERE d.location_id = l.location_id
                              )
                            )
                          )
                        )
                        FROM locations l
                        WHERE l.country_id = c.country_id
                      )
                    )
                  )
                )
                FROM countries c
                WHERE c.region_id = r.region_id
              )
            )
          )
        )
        FROM regions r
      )
    )
  ) AS CLOB INDENT SIZE = 2
) AS xml_resultado
FROM dual;`;

const XML_SCHEMA_CODE = `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" elementFormDefault="qualified">
  <xs:element name="Corporacion">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="Regiones">
          <xs:complexType>
            <xs:sequence>
              <xs:element name="Region" maxOccurs="unbounded">
                <xs:complexType>
                  <xs:sequence>
                    <xs:element name="Paises" minOccurs="0">
                      <xs:complexType>
                        <xs:sequence>
                          <xs:element name="Pais" maxOccurs="unbounded">
                            <xs:complexType>
                              <xs:sequence>
                                <xs:element name="Localizaciones" minOccurs="0">
                                  <xs:complexType>
                                    <xs:sequence>
                                      <xs:element name="Localizacion" maxOccurs="unbounded">
                                        <xs:complexType>
                                          <xs:sequence>
                                            <xs:element name="Direccion" type="xs:string" minOccurs="0"/>
                                            <xs:element name="CodigoPostal" type="xs:string" minOccurs="0"/>
                                            <xs:element name="Ciudad" type="xs:string"/>
                                            <xs:element name="Provincia" type="xs:string" minOccurs="0"/>
                                            <xs:element name="Departamentos" minOccurs="0">
                                              <xs:complexType>
                                                <xs:sequence>
                                                  <xs:element name="Departamento" maxOccurs="unbounded">
                                                    <xs:complexType>
                                                      <xs:sequence>
                                                        <xs:element name="Empleados" minOccurs="0">
                                                          <xs:complexType>
                                                            <xs:sequence>
                                                              <xs:element name="Empleado" maxOccurs="unbounded">
                                                                <xs:complexType>
                                                                  <xs:sequence>
                                                                    <xs:element name="Nombre" type="xs:string" minOccurs="0"/>
                                                                    <xs:element name="Apellido" type="xs:string"/>
                                                                    <xs:element name="Correo" type="xs:string"/>
                                                                    <xs:element name="Telefono" type="xs:string" minOccurs="0"/>
                                                                    <xs:element name="FechaContratacion" type="xs:date"/>
                                                                    <xs:element name="Salario" type="xs:decimal" minOccurs="0"/>
                                                                    <xs:element name="Comision" type="xs:decimal" minOccurs="0"/>
                                                                    <xs:element name="TrabajoActual">
                                                                      <xs:complexType>
                                                                        <xs:sequence>
                                                                          <xs:element name="SalarioMinimo" type="xs:decimal" minOccurs="0"/>
                                                                          <xs:element name="SalarioMaximo" type="xs:decimal" minOccurs="0"/>
                                                                        </xs:sequence>
                                                                        <xs:attribute name="id" type="xs:string" use="required"/>
                                                                        <xs:attribute name="titulo" type="xs:string" use="required"/>
                                                                      </xs:complexType>
                                                                    </xs:element>
                                                                    <xs:element name="HistorialLaboral" minOccurs="0">
                                                                      <xs:complexType>
                                                                        <xs:sequence>
                                                                          <xs:element name="Historial" maxOccurs="unbounded">
                                                                            <xs:complexType>
                                                                              <xs:sequence>
                                                                                <xs:element name="FechaInicio" type="xs:date"/>
                                                                                <xs:element name="FechaFin" type="xs:date"/>
                                                                                <xs:element name="IdTrabajo" type="xs:string"/>
                                                                                <xs:element name="IdDepartamento" type="xs:integer" minOccurs="0"/>
                                                                              </xs:sequence>
                                                                            </xs:complexType>
                                                                          </xs:element>
                                                                        </xs:sequence>
                                                                      </xs:complexType>
                                                                    </xs:element>
                                                                  </xs:sequence>
                                                                  <xs:attribute name="id" type="xs:integer" use="required"/>
                                                                </xs:complexType>
                                                              </xs:element>
                                                            </xs:sequence>
                                                          </xs:complexType>
                                                        </xs:element>
                                                      </xs:sequence>
                                                      <xs:attribute name="id" type="xs:integer" use="required"/>
                                                      <xs:attribute name="nombre" type="xs:string" use="required"/>
                                                    </xs:complexType>
                                                  </xs:element>
                                                </xs:sequence>
                                              </xs:complexType>
                                            </xs:element>
                                          </xs:sequence>
                                          <xs:attribute name="id" type="xs:integer" use="required"/>
                                        </xs:complexType>
                                      </xs:element>
                                    </xs:sequence>
                                  </xs:complexType>
                                </xs:element>
                              </xs:sequence>
                              <xs:attribute name="id" type="xs:string" use="required"/>
                              <xs:attribute name="nombre" type="xs:string"/>
                            </xs:complexType>
                          </xs:element>
                        </xs:sequence>
                      </xs:complexType>
                    </xs:element>
                  </xs:sequence>
                  <xs:attribute name="id" type="xs:integer" use="required"/>
                  <xs:attribute name="nombre" type="xs:string"/>
                </xs:complexType>
              </xs:element>
            </xs:sequence>
          </xs:complexType>
        </xs:element>
      </xs:sequence>
    </xs:complexType>
  </xs:element>
</xs:schema>`;

const SQL_REGISTRATION_CODE = `-- Script PL/SQL para registrar el esquema en Oracle XML DB e insertar datos
DECLARE
  v_schema_xsd CLOB;
BEGIN
  v_schema_xsd := '... [Contenido del XSD] ...';

  -- Eliminación previa para re-ejecución limpia
  BEGIN
    DBMS_XMLSCHEMA.deleteSchema(
      schemaurl => 'http://localhost/corporacion.xsd',
      delete_option => DBMS_XMLSCHEMA.DELETE_CASCADE
    );
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Registro del esquema XML
  DBMS_XMLSCHEMA.registerSchema(
    schemaurl => 'http://localhost/corporacion.xsd',
    schemadoc => v_schema_xsd,
    local     => TRUE,
    genTypes  => TRUE,
    genTables => FALSE
  );
  DBMS_OUTPUT.put_line('Esquema XML de Corporacion registrado con éxito.');
END;
/

-- Creación de la tabla XMLType vinculada al esquema
CREATE TABLE registro_corporativo (
  id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  xml_data XMLTYPE
)
XMLTYPE xml_data STORE AS SECUREFILE BINARY XML
XMLSCHEMA "http://localhost/corporacion.xsd" ELEMENT "Corporacion";

-- Inserción Válida
INSERT INTO registro_corporativo (xml_data) VALUES (
  XMLTYPE('<?xml version="1.0" encoding="UTF-8"?>
<Corporacion>
  <Regiones>
    <Region id="1" nombre="Europe">
      <Paises>
        <Pais id="UK" nombre="United Kingdom">
          <Localizaciones>
            <Localizacion id="2400">
              <Direccion>8204 Arthur St</Direccion>
              <CodigoPostal>Magna</CodigoPostal>
              <Ciudad>London</Ciudad>
              <Provincia>Greater London</Provincia>
              <Departamentos>
                <Departamento id="80" nombre="Sales">
                  <Empleados>
                    <Empleado id="145">
                      <Nombre>John</Nombre>
                      <Apellido>Russell</Apellido>
                      <Correo>JRUSSELL</Correo>
                      <Telefono>011.44.1344.429268</Telefono>
                      <FechaContratacion>2004-10-01</FechaContratacion>
                      <Salario>14000.00</Salario>
                      <TrabajoActual id="SA_MAN" titulo="Sales Manager">
                        <SalarioMinimo>10000.00</SalarioMinimo>
                        <SalarioMaximo>20080.00</SalarioMaximo>
                      </TrabajoActual>
                      <HistorialLaboral>
                        <Historial>
                          <FechaInicio>1997-01-01</FechaInicio>
                          <FechaFin>1999-12-31</FechaFin>
                          <IdTrabajo>SA_REP</IdTrabajo>
                          <IdDepartamento>80</IdDepartamento>
                        </Historial>
                      </HistorialLaboral>
                    </Empleado>
                  </Empleados>
                </Departamento>
              </Departamentos>
            </Localizacion>
          </Localizaciones>
        </Pais>
      </Paises>
    </Region>
  </Regiones>
</Corporacion>')
);
COMMIT;`;

const VALID_XML_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<Corporacion>
  <Regiones>
    <!-- Región 1: Europe -->
    <Region id="1" nombre="Europe">
      <Paises>
        <!-- País: UK (United Kingdom) -->
        <Pais id="UK" nombre="United Kingdom">
          <Localizaciones>
            <!-- Localización: 2400 (London) -->
            <Localizacion id="2400">
              <Direccion>8204 Arthur St</Direccion>
              <CodigoPostal>Magna</CodigoPostal>
              <Ciudad>London</Ciudad>
              <Provincia>Greater London</Provincia>
              <Departamentos>
                <!-- Departamento: 80 (Sales) -->
                <Departamento id="80" nombre="Sales">
                  <Empleados>
                    <!-- Empleado: 145 (John Russell) -->
                    <Empleado id="145">
                      <Nombre>John</Nombre>
                      <Apellido>Russell</Apellido>
                      <Correo>JRUSSELL</Correo>
                      <Telefono>011.44.1344.429268</Telefono>
                      <FechaContratacion>2004-10-01</FechaContratacion>
                      <Salario>14000.00</Salario>

                      <!-- Trabajo Actual de Empleado (Jobs) -->
                      <TrabajoActual id="SA_MAN" titulo="Sales Manager">
                        <SalarioMinimo>10000.00</SalarioMinimo>
                        <SalarioMaximo>20080.00</SalarioMaximo>
                      </TrabajoActual>

                      <!-- Historial Laboral del Empleado (Job History) -->
                      <HistorialLaboral>
                        <Historial>
                          <FechaInicio>1997-01-01</FechaInicio>
                          <FechaFin>1999-12-31</FechaFin>
                          <IdTrabajo>SA_REP</IdTrabajo>
                          <IdDepartamento>80</IdDepartamento>
                        </Historial>
                        <Historial>
                          <FechaInicio>2000-01-01</FechaInicio>
                          <FechaFin>2004-09-30</FechaFin>
                          <IdTrabajo>SA_MAN</IdTrabajo>
                          <IdDepartamento>80</IdDepartamento>
                        </Historial>
                      </HistorialLaboral>
                    </Empleado>

                    <!-- Empleado: 146 (Maria Gomez) -->
                    <Empleado id="146">
                      <Nombre>Maria</Nombre>
                      <Apellido>Gomez</Apellido>
                      <Correo>MGOMEZ</Correo>
                      <Telefono>011.44.1344.429269</Telefono>
                      <FechaContratacion>2010-06-15</FechaContratacion>
                      <Salario>13500.00</Salario>
                      <TrabajoActual id="SA_REP" titulo="Sales Representative">
                        <SalarioMinimo>8000.00</SalarioMinimo>
                        <SalarioMaximo>15000.00</SalarioMaximo>
                      </TrabajoActual>
                    </Empleado>

                    <!-- Empleado: 147 (Luis Martinez) -->
                    <Empleado id="147">
                      <Nombre>Luis</Nombre>
                      <Apellido>Martinez</Apellido>
                      <Correo>LMARTINEZ</Correo>
                      <Telefono>011.44.1344.429270</Telefono>
                      <FechaContratacion>2012-03-01</FechaContratacion>
                      <Salario>12000.00</Salario>
                      <TrabajoActual id="SA_REP" titulo="Sales Representative">
                        <SalarioMinimo>8000.00</SalarioMinimo>
                        <SalarioMaximo>15000.00</SalarioMaximo>
                      </TrabajoActual>
                    </Empleado>

                    <!-- Empleado: 148 (Ana Ruiz) -->
                    <Empleado id="148">
                      <Nombre>Ana</Nombre>
                      <Apellido>Ruiz</Apellido>
                      <Correo>ARUIZ</Correo>
                      <Telefono>011.44.1344.429271</Telefono>
                      <FechaContratacion>2015-09-21</FechaContratacion>
                      <Salario>11000.00</Salario>
                      <TrabajoActual id="SA_REP" titulo="Sales Representative">
                        <SalarioMinimo>8000.00</SalarioMinimo>
                        <SalarioMaximo>15000.00</SalarioMaximo>
                      </TrabajoActual>
                    </Empleado>

                    <!-- Empleado: 149 (Carlos Perez) -->
                    <Empleado id="149">
                      <Nombre>Carlos</Nombre>
                      <Apellido>Perez</Apellido>
                      <Correo>CPEREZ</Correo>
                      <Telefono>011.44.1344.429272</Telefono>
                      <FechaContratacion>2018-11-05</FechaContratacion>
                      <Salario>12500.00</Salario>
                      <TrabajoActual id="SA_REP" titulo="Sales Representative">
                        <SalarioMinimo>8000.00</SalarioMinimo>
                        <SalarioMaximo>15000.00</SalarioMaximo>
                      </TrabajoActual>
                    </Empleado>
                  </Empleados>
                </Departamento>
              </Departamentos>
            </Localizacion>
          </Localizaciones>
        </Pais>
      </Paises>
    </Region>
  </Regiones>
</Corporacion>`;

const INVALID_XML_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<Corporacion>
  <Regiones>
    <!-- ERROR 1: id de Region debe ser entero (xs:integer) -->
    <Region id="Europa-Uno" nombre="Europe">
      <Paises>
        <!-- ERROR 2: Falta el atributo obligatorio id en Pais -->
        <Pais nombre="United Kingdom">
          <Localizaciones>
            <Localizacion id="2400">
              <Ciudad>London</Ciudad>
              <Departamentos>
                <Departamento id="80" nombre="Sales">
                  <Empleados>
                    <Empleado id="145">
                      <Nombre>John</Nombre>
                      <Apellido>Russell</Apellido>
                      <Correo>JRUSSELL</Correo>
                      <!-- ERROR 3: FechaContratacion debe ser de tipo xs:date (YYYY-MM-DD) -->
                      <FechaContratacion>01/10/2004</FechaContratacion>
                      <Salario>14000.00</Salario>
                      
                      <!-- ERROR 4: TrabajoActual no posee el atributo obligatorio 'titulo' -->
                      <TrabajoActual id="SA_MAN">
                        <SalarioMinimo>10000.00</SalarioMinimo>
                      </TrabajoActual>

                      <HistorialLaboral>
                        <Historial>
                          <FechaInicio>1997-01-01</FechaInicio>
                          <!-- ERROR 5: FechaFin tiene un formato inválido -->
                          <FechaFin>FIN_DE_SIGLO</FechaFin>
                          <IdTrabajo>SA_REP</IdTrabajo>
                        </Historial>
                      </HistorialLaboral>
                    </Empleado>
                  </Empleados>
                </Departamento>
              </Departamentos>
            </Localizacion>
          </Localizaciones>
        </Pais>
      </Paises>
    </Region>
  </Regiones>
</Corporacion>`;

const XPATH_SAMPLE_QUERIES = [
  {
    label: "Nombres de empleados",
    query: "/Corporacion/Regiones/Region/Paises/Pais/Localizaciones/Localizacion/Departamentos/Departamento/Empleados/Empleado/Nombre/text()"
  },
  {
    label: "Total de empleados",
    query: "count(/Corporacion/Regiones/Region/Paises/Pais/Localizaciones/Localizacion/Departamentos/Departamento/Empleados/Empleado)"
  },
  {
    label: "Empleados con salario > 13000",
    query: "//Empleado[Salario&gt;13000]/Nombre/text()"
  },
  {
    label: "Departamentos del país UK",
    query: "/Corporacion/Regiones/Region/Paises/Pais[@id='UK']/Localizaciones/Localizacion/Departamentos/Departamento/@nombre"
  }
];

const XQUERY_SAMPLE_QUERIES = [
  {
    id: "empleados",
    label: "Lista de empleados con nombre y apellido"
  },
  {
    id: "paises",
    label: "Resumen de países"
  },
  {
    id: "departamentos",
    label: "Departamentos con cantidad de empleados"
  }
];

const XSLT_STYLESHEET = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>
  <xsl:template match="/">
    <html>
      <head>
        <meta charset="UTF-8"/>
        <title>Corporación HR</title>
        <style>
          body { font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 20px; }
          h1 { color: #38bdf8; margin-bottom: 12px; }
          h2 { color: #a5b4fc; margin-top: 18px; }
          ul { margin-left: 18px; }
          li { margin-bottom: 6px; }
          .card { background: rgba(15, 23, 42, 0.95); border: 1px solid #334155; padding: 14px; border-radius: 12px; margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <h1>Resumen Corporativo</h1>
        <xsl:for-each select="Corporacion/Regiones/Region">
          <div class="card">
            <h2>Región: <xsl:value-of select="@nombre"/></h2>
            <xsl:for-each select="Paises/Pais">
              <h3>País: <xsl:value-of select="@nombre"/> (<xsl:value-of select="@id"/>)</h3>
              <ul>
                <xsl:for-each select="Localizaciones/Localizacion/Departamentos/Departamento">
                  <li>
                    <strong>Departamento:</strong> <xsl:value-of select="@nombre"/> 
                    <em>(<xsl:value-of select="count(Empleados/Empleado)"/> empleados)</em>
                  </li>
                </xsl:for-each>
              </ul>
            </xsl:for-each>
          </div>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`;

// 2. INICIALIZACIÓN Y NAVEGACIÓN SPA
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  loadCodeContents();
  initQuerySimulator();
  initInteractiveValidator();
  initOracleConsole();
  initXPathXQuery();
  initXsltTransformer();
});

function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll(".content-section");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const targetId = item.getAttribute("data-target");
      
      // Remover clases activas de la navegación
      navItems.forEach(nav => nav.classList.remove("active"));
      item.classList.add("active");
      
      // Transición de secciones
      sections.forEach(sec => {
        if (sec.id === targetId) {
          sec.style.display = "block";
          setTimeout(() => {
            sec.classList.add("active");
          }, 50);
        } else {
          sec.classList.remove("active");
          sec.style.display = "none";
        }
      });
    });
  });
}

function loadCodeContents() {
  document.getElementById("code-sql-content").textContent = SQL_QUERY_CODE;
  document.getElementById("code-xsd-content").textContent = XML_SCHEMA_CODE;
  document.getElementById("code-reg-content").textContent = SQL_REGISTRATION_CODE;
  document.getElementById("code-xslt-content").textContent = XSLT_STYLESHEET;
}

// 3. SIMULADOR DE CONSULTA SQL/XML
function initQuerySimulator() {
  const btnRun = document.getElementById("btn-run-sql");
  const codeXmlSimulated = document.getElementById("code-xml-simulated");
  const btnCopySql = document.getElementById("btn-copy-sql");
  const btnCopyXml = document.getElementById("btn-copy-xml-sim");
  const btnDownloadXml = document.getElementById("btn-download-xml");

  btnRun.addEventListener("click", () => {
    btnRun.disabled = true;
    btnRun.innerText = "Ejecutando consulta en Oracle...";
    codeXmlSimulated.textContent = "Conectando al esquema HR...\nAnalizando jerarquía de las 7 tablas (REGIONS, COUNTRIES, LOCATIONS, DEPARTMENTS, EMPLOYEES, JOBS, JOB_HISTORY)...\nEjecutando funciones XMLAGG anidadas y XMLSERIALIZE...\nRetornando CLOB formateado...";

    setTimeout(() => {
      codeXmlSimulated.textContent = VALID_XML_SAMPLE;
      btnRun.disabled = false;
      btnRun.innerText = "Re-ejecutar Consulta";
    }, 1200);
  });

  // Funcionalidad de Copiado
  btnCopySql.addEventListener("click", () => copyToClipboard(SQL_QUERY_CODE, btnCopySql, "¡Copiado!"));
  btnCopyXml.addEventListener("click", () => {
    if (codeXmlSimulated.textContent.startsWith("<?xml")) {
      copyToClipboard(codeXmlSimulated.textContent, btnCopyXml, "¡Copiado!");
    } else {
      alert("Primero debes ejecutar la consulta para simular el XML.");
    }
  });

  // Funcionalidad de Descarga
  btnDownloadXml.addEventListener("click", () => {
    if (codeXmlSimulated.textContent.startsWith("<?xml")) {
      downloadFile(codeXmlSimulated.textContent, "hr_corporacion.xml", "text/xml");
    } else {
      alert("Primero debes ejecutar la consulta para descargar el XML.");
    }
  });

  // Copiado y descarga del XSD
  const btnCopyXsd = document.getElementById("btn-copy-xsd");
  const btnDownloadXsd = document.getElementById("btn-download-xsd");
  btnCopyXsd.addEventListener("click", () => copyToClipboard(XML_SCHEMA_CODE, btnCopyXsd, "¡Copiado!"));
  btnDownloadXsd.addEventListener("click", () => downloadFile(XML_SCHEMA_CODE, "schema.xsd", "text/xml"));

  // Copiado del script de registro
  const btnCopyRegSql = document.getElementById("btn-copy-reg-sql");
  btnCopyRegSql.addEventListener("click", () => copyToClipboard(SQL_REGISTRATION_CODE, btnCopyRegSql, "¡Copiado!"));
}

// 4. MOTOR DE VALIDACIÓN INTERACTIVA (XML vs XSD de 7 niveles)
function initInteractiveValidator() {
  const txtXml = document.getElementById("txt-val-xml");
  const btnLoadValid = document.getElementById("btn-load-valid");
  const btnLoadInvalid = document.getElementById("btn-load-invalid");
  const btnValidate = document.getElementById("btn-run-validation");
  
  const statusBox = document.getElementById("validation-status");
  const statusIcon = document.getElementById("val-status-icon");
  const statusTitle = document.getElementById("val-status-title");
  const statusDesc = document.getElementById("val-status-desc");
  const errorLogCard = document.getElementById("error-log-card");
  const errorList = document.getElementById("val-errors-list");

  // Precargar XML válido al inicio
  txtXml.value = VALID_XML_SAMPLE;

  btnLoadValid.addEventListener("click", () => {
    txtXml.value = VALID_XML_SAMPLE;
    resetValidationStatus();
  });

  btnLoadInvalid.addEventListener("click", () => {
    txtXml.value = INVALID_XML_SAMPLE;
    resetValidationStatus();
  });

  btnValidate.addEventListener("click", () => {
    const xmlText = txtXml.value.trim();
    if (!xmlText) {
      alert("Por favor, ingresa un código XML para validar.");
      return;
    }

    resetValidationStatus();
    
    // Analizador del Navegador (Well-formedness check)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const parseError = xmlDoc.getElementsByTagName("parsererror");

    if (parseError.length > 0) {
      showValidationResult(false, "Error de Sintaxis XML", "El documento XML no posee una sintaxis bien formada.", [
        `Fallo al procesar el parser: ${parseError[0].textContent}`
      ]);
      return;
    }

    // Validación semántica según las reglas del XSD de 7 tablas
    const errors = [];
    const root = xmlDoc.documentElement;

    // 1. Elemento raíz
    if (root.tagName !== "Corporacion") {
      errors.push(`El elemento raíz debe llamarse <strong>Corporacion</strong>, pero se encontró <strong>&lt;${root.tagName}&gt;</strong>.`);
    } else {
      // 2. Regiones
      const regionesWrapper = root.firstElementChild;
      if (!regionesWrapper || regionesWrapper.tagName !== "Regiones") {
        errors.push("El elemento raíz <strong>Corporacion</strong> debe contener exactamente un elemento hijo llamado <strong>Regiones</strong>.");
      } else {
        const regiones = regionesWrapper.getElementsByTagName("Region");
        if (regiones.length === 0) {
          errors.push("El elemento <strong>Regiones</strong> debe contener al menos un elemento <strong>Region</strong>.");
        }

        for (let i = 0; i < regiones.length; i++) {
          const reg = regiones[i];
          const regIdAttr = reg.getAttribute("id");
          const regRef = `Region[${i+1}]`;

          if (!regIdAttr) {
            errors.push(`En <strong>${regRef}</strong>: Falta el atributo obligatorio <strong>id</strong>.`);
          } else if (!/^\d+$/.test(regIdAttr)) {
            errors.push(`En <strong>${regRef}</strong> (id="${regIdAttr}"): El atributo <strong>id</strong> debe ser un número entero (tipo xs:integer).`);
          }

          // 3. Paises
          const paisesWrapper = reg.querySelector(":scope > Paises");
          if (paisesWrapper) {
            const paises = paisesWrapper.getElementsByTagName("Pais");
            for (let j = 0; j < paises.length; j++) {
              const pais = paises[j];
              const paisIdAttr = pais.getAttribute("id");
              const paisRef = `Pais[${j+1}] de la Región ${regIdAttr || ''}`;

              if (!paisIdAttr) {
                errors.push(`En <strong>${paisRef}</strong>: Falta el atributo obligatorio <strong>id</strong>.`);
              }

              // 4. Localizaciones
              const locsWrapper = pais.querySelector(":scope > Localizaciones");
              if (locsWrapper) {
                const locs = locsWrapper.getElementsByTagName("Localizacion");
                for (let k = 0; k < locs.length; k++) {
                  const loc = locs[k];
                  const locIdAttr = loc.getAttribute("id");
                  const locRef = `Localización[${k+1}] en el País ${paisIdAttr || ''}`;

                  if (!locIdAttr) {
                    errors.push(`En <strong>${locRef}</strong>: Falta el atributo obligatorio <strong>id</strong>.`);
                  } else if (!/^\d+$/.test(locIdAttr)) {
                    errors.push(`En <strong>${locRef}</strong> (id="${locIdAttr}"): El atributo <strong>id</strong> de Localizacion debe ser un entero.`);
                  }

                  const ciudadEl = loc.querySelector(":scope > Ciudad");
                  if (!ciudadEl) {
                    errors.push(`En <strong>${locRef}</strong>: Falta el elemento hijo obligatorio <strong>&lt;Ciudad&gt;</strong>.`);
                  }

                  // 5. Departamentos
                  const deptsWrapper = loc.querySelector(":scope > Departamentos");
                  if (deptsWrapper) {
                    const depts = deptsWrapper.getElementsByTagName("Departamento");
                    for (let d = 0; d < depts.length; d++) {
                      const dept = depts[d];
                      const deptIdAttr = dept.getAttribute("id");
                      const deptNombreAttr = dept.getAttribute("nombre");
                      const deptRef = `Departamento[${d+1}] en Localización ${locIdAttr || ''}`;

                      if (!deptIdAttr) {
                        errors.push(`En <strong>${deptRef}</strong>: Falta el atributo obligatorio <strong>id</strong>.`);
                      } else if (!/^\d+$/.test(deptIdAttr)) {
                        errors.push(`En <strong>${deptRef}</strong> (id="${deptIdAttr}"): El atributo <strong>id</strong> de Departamento debe ser un entero.`);
                      }
                      if (!deptNombreAttr) {
                        errors.push(`En <strong>${deptRef}</strong>: Falta el atributo obligatorio <strong>nombre</strong>.`);
                      }

                      // 6. Empleados
                      const empsWrapper = dept.querySelector(":scope > Empleados");
                      if (empsWrapper) {
                        const emps = empsWrapper.getElementsByTagName("Empleado");
                        for (let e = 0; e < emps.length; e++) {
                          const emp = emps[e];
                          const empIdAttr = emp.getAttribute("id");
                          const empRef = `Empleado[${e+1}] en Departamento ${deptIdAttr || ''}`;

                          if (!empIdAttr) {
                            errors.push(`En <strong>${empRef}</strong>: Falta el atributo obligatorio <strong>id</strong>.`);
                          } else if (!/^\d+$/.test(empIdAttr)) {
                            errors.push(`En <strong>${empRef}</strong> (id="${empIdAttr}"): El atributo <strong>id</strong> de Empleado debe ser un entero.`);
                          }

                          // Elementos del Empleado
                          const apellidoEl = emp.querySelector(":scope > Apellido");
                          const correoEl = emp.querySelector(":scope > Correo");
                          const hireEl = emp.querySelector(":scope > FechaContratacion");
                          const salarioEl = emp.querySelector(":scope > Salario");

                          if (!apellidoEl) errors.push(`En <strong>${empRef}</strong>: Falta el elemento obligatorio <strong>&lt;Apellido&gt;</strong>.`);
                          if (!correoEl) errors.push(`En <strong>${empRef}</strong>: Falta el elemento obligatorio <strong>&lt;Correo&gt;</strong>.`);
                          
                          if (!hireEl) {
                            errors.push(`En <strong>${empRef}</strong>: Falta el elemento obligatorio <strong>&lt;FechaContratacion&gt;</strong>.`);
                          } else {
                            const dateVal = hireEl.textContent.trim();
                            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateVal) || isNaN(Date.parse(dateVal))) {
                              errors.push(`En <strong>${empRef}</strong>: El valor de FechaContratacion <strong>"${dateVal}"</strong> no cumple con el tipo xs:date (formato esperado YYYY-MM-DD).`);
                            }
                          }

                          if (salarioEl) {
                            const salVal = salarioEl.textContent.trim();
                            if (isNaN(Number(salVal)) || salVal === "") {
                              errors.push(`En <strong>${empRef}</strong> (id="${empIdAttr || ''}"): El valor de Salario <strong>"${salVal}"</strong> no es de tipo decimal válido (xs:decimal).`);
                            }
                          }

                          // 7. Trabajo Actual (Jobs)
                          const jobEl = emp.querySelector(":scope > TrabajoActual");
                          if (!jobEl) {
                            errors.push(`En <strong>${empRef}</strong>: Falta el elemento obligatorio <strong>&lt;TrabajoActual&gt;</strong>.`);
                          } else {
                            const jobIdAttr = jobEl.getAttribute("id");
                            const jobTitleAttr = jobEl.getAttribute("titulo");
                            if (!jobIdAttr) errors.push(`En <strong>TrabajoActual</strong> del Empleado ${empIdAttr || ''}: Falta el atributo obligatorio <strong>id</strong>.`);
                            if (!jobTitleAttr) errors.push(`En <strong>TrabajoActual</strong> del Empleado ${empIdAttr || ''}: Falta el atributo obligatorio <strong>titulo</strong>.`);
                          }

                          // 8. Historial Laboral (Job History)
                          const histWrapper = emp.querySelector(":scope > HistorialLaboral");
                          if (histWrapper) {
                            const hists = histWrapper.getElementsByTagName("Historial");
                            for (let h = 0; h < hists.length; h++) {
                              const hist = hists[h];
                              const histRef = `Historial[${h+1}] del Empleado ${empIdAttr || ''}`;

                              const startEl = hist.querySelector(":scope > FechaInicio");
                              const endEl = hist.querySelector(":scope > FechaFin");
                              const idTrabajoEl = hist.querySelector(":scope > IdTrabajo");

                              if (!startEl) errors.push(`En <strong>${histRef}</strong>: Falta el elemento obligatorio <strong>&lt;FechaInicio&gt;</strong>.`);
                              else {
                                const val = startEl.textContent.trim();
                                if (!/^\d{4}-\d{2}-\d{2}$/.test(val) || isNaN(Date.parse(val))) {
                                  errors.push(`En <strong>${histRef}</strong>: La FechaInicio <strong>"${val}"</strong> no es una fecha válida (YYYY-MM-DD).`);
                                }
                              }

                              if (!endEl) errors.push(`En <strong>${histRef}</strong>: Falta el elemento obligatorio <strong>&lt;FechaFin&gt;</strong>.`);
                              else {
                                const val = endEl.textContent.trim();
                                if (!/^\d{4}-\d{2}-\d{2}$/.test(val) || isNaN(Date.parse(val))) {
                                  errors.push(`En <strong>${histRef}</strong>: La FechaFin <strong>"${val}"</strong> no es una fecha válida (YYYY-MM-DD).`);
                                }
                              }

                              if (!idTrabajoEl) errors.push(`En <strong>${histRef}</strong>: Falta el elemento obligatorio <strong>&lt;IdTrabajo&gt;</strong>.`);
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // Mostrar el veredicto de validación
    if (errors.length === 0) {
      showValidationResult(true, "XML Válido", "El documento cumple perfectamente con todas las restricciones del esquema schema.xsd de 7 tablas.", []);
    } else {
      showValidationResult(false, "Validación Fallida", "Se encontraron discrepancias de estructura o tipo de datos contra el esquema XSD de 7 tablas.", errors);
    }
  });

  function resetValidationStatus() {
    statusBox.className = "validation-status-box idled";
    statusIcon.textContent = "?";
    statusTitle.textContent = "Esperando validación";
    statusDesc.textContent = "Haz clic en 'Validar XML' para analizar el código.";
    errorLogCard.style.display = "none";
    errorList.innerHTML = "";
  }

  function showValidationResult(isSuccess, title, desc, errorsArray) {
    if (isSuccess) {
      statusBox.className = "validation-status-box success";
      statusIcon.textContent = "✓";
      statusTitle.textContent = title;
      statusDesc.textContent = desc;
      errorLogCard.style.display = "none";
    } else {
      statusBox.className = "validation-status-box failed";
      statusIcon.textContent = "✗";
      statusTitle.textContent = title;
      statusDesc.textContent = desc;

      if (errorsArray.length > 0) {
        errorList.innerHTML = errorsArray.map(err => `<li>${err}</li>`).join("");
        errorLogCard.style.display = "block";
      }
    }
  }
}

// 5. SIMULADOR DE CONSOLA DE BASE DE DATOS (ORACLE)
function initOracleConsole() {
  const consoleEl = document.getElementById("oracle-console");
  const btnReg = document.getElementById("btn-sim-reg");
  const btnInsertOk = document.getElementById("btn-sim-insert-ok");
  const btnInsertErr = document.getElementById("btn-sim-insert-err");
  const btnClear = document.getElementById("btn-sim-clear");

  btnReg.addEventListener("click", () => {
    printConsoleLine("DECLARE\n  v_schema_xsd CLOB;\nBEGIN\n  v_schema_xsd := '...';\n  DBMS_XMLSCHEMA.registerSchema('http://localhost/corporacion.xsd', v_schema_xsd);\nEND;\n/", "input");
    setTimeout(() => {
      printConsoleLine("PL/SQL procedure successfully completed.", "success-msg");
      printConsoleLine("SQL> CREATE TABLE registro_corporativo(id NUMBER GENERATED BY DEFAULT AS IDENTITY, xml_data XMLTYPE) XMLTYPE xml_data STORE AS SECUREFILE BINARY XML XMLSCHEMA \"http://localhost/corporacion.xsd\" ELEMENT \"Corporacion\";", "input");
      setTimeout(() => {
        printConsoleLine("Table REGISTRO_CORPORATIVO created.", "success-msg");
        btnReg.disabled = true;
        btnInsertOk.disabled = false;
      }, 600);
    }, 800);
  });

  btnInsertOk.addEventListener("click", () => {
    printConsoleLine("INSERT INTO registro_corporativo (xml_data) VALUES (XMLTYPE('<?xml version=\"1.0\"?><Corporacion><Regiones><Region id=\"1\" nombre=\"Europe\"><Paises><Pais id=\"UK\" nombre=\"United Kingdom\">...</Pais></Paises></Region></Regiones></Corporacion>'));", "input");
    setTimeout(() => {
      printConsoleLine("1 row created.", "success-msg");
      printConsoleLine("SQL> COMMIT;", "input");
      printConsoleLine("Commit complete.", "success-msg");
      btnInsertOk.disabled = true;
      btnInsertErr.disabled = false;
    }, 600);
  });

  btnInsertErr.addEventListener("click", () => {
    printConsoleLine("INSERT INTO registro_corporativo (xml_data) VALUES (XMLTYPE('<?xml version=\"1.0\"?><Corporacion><Regiones><Region id=\"Europa-Uno\" nombre=\"Europe\"><Paises><Pais nombre=\"United Kingdom\">...</Pais></Paises></Region></Regiones></Corporacion>'));", "input");
    setTimeout(() => {
      printConsoleLine("ERROR at line 1:\nORA-30937: No schema definition for 'Region' in parent '/Corporacion/Regiones'\nORA-06512: at \"SYS.XMLTYPE\", line 354\nORA-06512: at line 1", "error-msg");
    }, 700);
  });

  btnClear.addEventListener("click", () => {
    consoleEl.innerHTML = "";
    printConsoleLine("Consola Oracle SQL*Plus inicializada. Registre el esquema XML para comenzar...", "system-msg");
    btnReg.disabled = false;
    btnInsertOk.disabled = true;
    btnInsertErr.disabled = true;
  });

  function printConsoleLine(text, className) {
    const line = document.createElement("div");
    line.className = `console-line ${className}`;
    line.textContent = text;
    consoleEl.appendChild(line);
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }
}

function initXPathXQuery() {
  const txtXml = document.getElementById("txt-xpath-xml");
  const txtQuery = document.getElementById("txt-xpath-query");
  const selectXPath = document.getElementById("select-xpath-sample");
  const btnLoad = document.getElementById("btn-load-xpath-xml");
  const btnRunXPath = document.getElementById("btn-run-xpath");
  const btnRunXQuery = document.getElementById("btn-run-xquery");
  const selectXQuery = document.getElementById("select-xquery-sample");
  const resultOutput = document.getElementById("code-xpath-result");

  txtXml.value = VALID_XML_SAMPLE;
  txtQuery.value = selectXPath.value;

  btnLoad.addEventListener("click", () => {
    txtXml.value = VALID_XML_SAMPLE;
    resultOutput.textContent = "XML de ejemplo cargado. Selecciona una consulta y presiona ejecutar.";
  });

  selectXPath.addEventListener("change", () => {
    txtQuery.value = selectXPath.value;
    resultOutput.textContent = "Consulta XPath seleccionada. Presiona Ejecutar XPath.";
  });

  btnRunXPath.addEventListener("click", () => {
    resultOutput.textContent = runXPathQuery(txtXml.value, txtQuery.value);
  });

  btnRunXQuery.addEventListener("click", async () => {
    resultOutput.textContent = await runXQuerySimulation(selectXQuery.value, txtXml.value);
  });
}

function runXPathQuery(xmlText, query) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "application/xml");
  const parserErrors = xmlDoc.getElementsByTagName("parsererror");

  if (parserErrors.length > 0) {
    return `Error de XML: ${parserErrors[0].textContent.trim()}`;
  }

  try {
    const result = xmlDoc.evaluate(query, xmlDoc, null, XPathResult.ANY_TYPE, null);
    switch (result.resultType) {
      case XPathResult.NUMBER_TYPE:
        return `Número: ${result.numberValue}`;
      case XPathResult.STRING_TYPE:
        return `Texto: ${result.stringValue}`;
      case XPathResult.BOOLEAN_TYPE:
        return `Booleano: ${result.booleanValue}`;
      default:
        const nodes = [];
        let node = result.iterateNext();
        while (node) {
          if (node.nodeType === Node.ATTRIBUTE_NODE) {
            nodes.push(`@${node.name} = ${node.value}`);
          } else if (node.nodeType === Node.TEXT_NODE) {
            nodes.push(node.nodeValue.trim());
          } else {
            nodes.push(node.outerHTML || node.textContent.trim());
          }
          node = result.iterateNext();
        }
        return nodes.length > 0 ? nodes.join("\n") : "No se encontraron nodos con esa expresión XPath.";
    }
  } catch (error) {
    return `Error en XPath: ${error.message}`;
  }
}

async function runXQuerySimulation(queryId, xmlText) {

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "application/xml");
  const parserErrors = xmlDoc.getElementsByTagName("parsererror");

  if (parserErrors.length > 0) {
    return `Error de XML: ${parserErrors[0].textContent.trim()}`;
  }

  if (queryId === "empleados") {
    const employees = xmlDoc.evaluate(
      "/Corporacion/Regiones/Region/Paises/Pais/Localizaciones/Localizacion/Departamentos/Departamento/Empleados/Empleado",
      xmlDoc,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    if (employees.snapshotLength === 0) {
      return "No se encontraron empleados en el XML.";
    }
    const lines = [];
    for (let i = 0; i < employees.snapshotLength; i++) {
      const emp = employees.snapshotItem(i);
      const nombre = emp.querySelector("Nombre")?.textContent || "(sin nombre)";
      const apellido = emp.querySelector("Apellido")?.textContent || "(sin apellido)";
      lines.push(`<Empleado>\n  <Nombre>${nombre}</Nombre>\n  <Apellido>${apellido}</Apellido>\n</Empleado>`);
    }
    return lines.join("\n\n");
  }

  if (queryId === "paises") {
    const paises = xmlDoc.evaluate(
      "/Corporacion/Regiones/Region/Paises/Pais",
      xmlDoc,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    if (paises.snapshotLength === 0) {
      return "No se encontraron países en el XML.";
    }
    const lines = [];
    for (let i = 0; i < paises.snapshotLength; i++) {
      const pais = paises.snapshotItem(i);
      const id = pais.getAttribute("id") || "(sin id)";
      const nombre = pais.getAttribute("nombre") || "(sin nombre)";
      lines.push(`<Pais>\n  <Id>${id}</Id>\n  <Nombre>${nombre}</Nombre>\n</Pais>`);
    }
    return lines.join("\n\n");
  }

  if (queryId === "departamentos") {
    const deps = xmlDoc.evaluate(
      "//Departamento",
      xmlDoc,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    if (deps.snapshotLength === 0) {
      return "No se encontraron departamentos en el XML.";
    }
    const lines = [];
    for (let i = 0; i < deps.snapshotLength; i++) {
      const dep = deps.snapshotItem(i);
      const nombre = dep.getAttribute("nombre") || "(sin nombre)";
      const count = dep.querySelectorAll("Empleados > Empleado").length;
      lines.push(`<Departamento nombre=\"${nombre}\">\n  <EmpleadoCount>${count}</EmpleadoCount>\n</Departamento>`);
    }
    return lines.join("\n\n");
  }

  if (queryId === "salariosAltos") {
    const employees = xmlDoc.evaluate(
      "//Empleado[Salario>13000]",
      xmlDoc,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    if (employees.snapshotLength === 0) {
      return "No se encontraron empleados con salario mayor a 13000.";
    }
    const lines = [];
    for (let i = 0; i < employees.snapshotLength; i++) {
      const emp = employees.snapshotItem(i);
      const nombre = emp.querySelector("Nombre")?.textContent || "(sin nombre)";
      const apellido = emp.querySelector("Apellido")?.textContent || "(sin apellido)";
      const salario = emp.querySelector("Salario")?.textContent || "(sin salario)";
      lines.push(`<Empleado>\n  <Nombre>${nombre}</Nombre>\n  <Apellido>${apellido}</Apellido>\n  <Salario>${salario}</Salario>\n</Empleado>`);
    }
    return lines.join("\n\n");
  }

  if (queryId === "regionesPaises") {
    const regions = xmlDoc.evaluate(
      "/Corporacion/Regiones/Region",
      xmlDoc,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    if (regions.snapshotLength === 0) {
      return "No se encontraron regiones en el XML.";
    }
    const lines = [];
    for (let i = 0; i < regions.snapshotLength; i++) {
      const region = regions.snapshotItem(i);
      const nombre = region.getAttribute("nombre") || "(sin nombre)";
      const paisCount = region.querySelectorAll("Paises > Pais").length;
      lines.push(`<Region nombre=\"${nombre}\">\n  <PaisCount>${paisCount}</PaisCount>\n</Region>`);
    }
    return lines.join("\n\n");
  }

  return "Consulta XQuery no soportada en la demo. Selecciona una opción válida.";
}

function initXsltTransformer() {
  const xsltCode = document.getElementById("code-xslt-content");
  const btnTransform = document.getElementById("btn-transform-xslt");
  const output = document.getElementById("xslt-transform-output");

  xsltCode.textContent = XSLT_STYLESHEET;

  btnTransform.addEventListener("click", () => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(VALID_XML_SAMPLE, "application/xml");
    const xslDoc = parser.parseFromString(XSLT_STYLESHEET, "application/xml");
    const xmlErrors = xmlDoc.getElementsByTagName("parsererror");
    const xslErrors = xslDoc.getElementsByTagName("parsererror");

    if (xmlErrors.length > 0) {
      output.innerHTML = `<div style="color:#ffb703;">Error en XML de entrada: ${xmlErrors[0].textContent}</div>`;
      return;
    }
    if (xslErrors.length > 0) {
      output.innerHTML = `<div style="color:#ffb703;">Error en XSLT: ${xslErrors[0].textContent}</div>`;
      return;
    }

    try {
      const processor = new XSLTProcessor();
      processor.importStylesheet(xslDoc);
      const fragment = processor.transformToFragment(xmlDoc, document);
      output.innerHTML = "";
      output.appendChild(fragment);
    } catch (error) {
      output.innerHTML = `<div style="color:#ffb703;">Fallo al transformar XSLT: ${error.message}</div>`;
    }
  });
}

// 7. FUNCIONES AUXILIARES COMUNES

function copyToClipboard(text, buttonEl, successText) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = buttonEl.innerText;
    buttonEl.innerText = successText;
    buttonEl.style.backgroundColor = "var(--accent)";
    setTimeout(() => {
      buttonEl.innerText = originalText;
      buttonEl.style.backgroundColor = "";
    }, 2000);
  }).catch(err => {
    console.error("Fallo al copiar: ", err);
  });
}

function downloadFile(content, fileName, contentType) {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}
