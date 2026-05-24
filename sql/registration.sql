-- ============================================================================
-- LABORATORIO 1: BASES DE DATOS XML EN ORACLE
-- ACTIVIDAD 4: REGISTRO DE ESQUEMA E INSERCIÓN (7 TABLAS DEL ESQUEMA HR)
-- ============================================================================
-- Este script realiza las siguientes tareas en Oracle:
--   1. Registra el esquema XML de 7 tablas (XSD) usando DBMS_XMLSCHEMA.
--   2. Crea una tabla con una columna XMLTYPE asociada al esquema XML de la corporación.
--   3. Realiza una inserción válida que cumple con el esquema.
--   4. Realiza una inserción inválida y describe el error esperado.
--   5. Consulta los datos almacenados.
--   6. Script de limpieza (DROP) para re-ejecuciones.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PASO A: REGISTRO DEL ESQUEMA XML EN ORACLE XML DB
-- ----------------------------------------------------------------------------
-- Registramos el esquema bajo la URL lógica: 'http://localhost/corporacion.xsd'

DECLARE
  v_schema_xsd CLOB;
BEGIN
  -- Definimos el contenido del XSD en un CLOB
  v_schema_xsd := '<?xml version="1.0" encoding="UTF-8"?>
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
</xs:schema>';

  -- Eliminamos el esquema si ya estuviera registrado previamente para evitar conflictos
  BEGIN
    DBMS_XMLSCHEMA.deleteSchema(
      schemaurl => 'http://localhost/corporacion.xsd',
      delete_option => DBMS_XMLSCHEMA.DELETE_CASCADE
    );
  EXCEPTION
    WHEN OTHERS THEN
      NULL;
  END;

  -- Registramos el nuevo esquema
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

-- ----------------------------------------------------------------------------
-- PASO B: CREACIÓN DE LA TABLA CON RESTRICCIÓN DE ESQUEMA XML
-- ----------------------------------------------------------------------------
-- Creamos la tabla 'registro_corporativo' restringida por el XSD.

CREATE TABLE registro_corporativo (
  id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  xml_data XMLTYPE
)
XMLTYPE xml_data STORE AS SECUREFILE BINARY XML
XMLSCHEMA "http://localhost/corporacion.xsd" ELEMENT "Corporacion";

-- ----------------------------------------------------------------------------
-- PASO C: INSERCIÓN VÁLIDA (SE AJUSTA AL ESQUEMA DE 7 NIVELES)
-- ----------------------------------------------------------------------------

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
                        <Historial>
                          <FechaInicio>2000-01-01</FechaInicio>
                          <FechaFin>2004-09-30</FechaFin>
                          <IdTrabajo>SA_MAN</IdTrabajo>
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

COMMIT;
PROMPT Inserción válida completada con éxito.

-- ----------------------------------------------------------------------------
-- PASO D: INSERCIÓN INVÁLIDA (FALLA LA VALIDACIÓN DEL ESQUEMA)
-- ----------------------------------------------------------------------------
-- Este bloque intentará realizar la inserción incorrecta y capturará el error.

DECLARE
  v_xml_invalid XMLTYPE;
BEGIN
  v_xml_invalid := XMLTYPE('<?xml version="1.0" encoding="UTF-8"?>
<Corporacion>
  <Regiones>
    <!-- ERROR 1: id no es entero -->
    <Region id="Europa-Uno" nombre="Europe">
      <Paises>
        <!-- ERROR 2: Falta atributo id en Pais -->
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
                      <!-- ERROR 3: Formato de fecha incorrecto -->
                      <FechaContratacion>01/10/2004</FechaContratacion>
                      <Salario>14000.00</Salario>
                      <!-- ERROR 4: Falta atributo titulo en TrabajoActual -->
                      <TrabajoActual id="SA_MAN">
                        <SalarioMinimo>10000.00</SalarioMinimo>
                      </TrabajoActual>
                      <HistorialLaboral>
                        <Historial>
                          <FechaInicio>1997-01-01</FechaInicio>
                          <!-- ERROR 5: FechaFin no es xs:date -->
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
</Corporacion>');

  INSERT INTO registro_corporativo (xml_data) VALUES (v_xml_invalid);
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    DBMS_OUTPUT.put_line('ERROR ESPERADO CAPTURADO:');
    DBMS_OUTPUT.put_line(SQLERRM);
END;
/

-- ----------------------------------------------------------------------------
-- PASO E: CONSULTA DE DATOS INSERTADOS
-- ----------------------------------------------------------------------------

SET LONG 20000;
SET PAGESIZE 100;
SELECT r.id, r.xml_data.getClobVal() AS xml_almacenado
FROM registro_corporativo r;

-- ============================================================================
-- SCRIPT DE LIMPIEZA
-- ============================================================================
-- DROP TABLE registro_corporativo;
-- BEGIN
--   DBMS_XMLSCHEMA.deleteSchema(
--     schemaurl => 'http://localhost/corporacion.xsd',
--     delete_option => DBMS_XMLSCHEMA.DELETE_CASCADE
--   );
-- END;
-- /
