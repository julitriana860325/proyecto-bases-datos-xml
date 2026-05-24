-- ============================================================================
-- LABORATORIO 1: BASES DE DATOS XML EN ORACLE
-- ACTIVIDAD 1 & 2: CONSULTA SQL/XML COMPLETA (7 TABLAS DEL ESQUEMA HR)
-- ============================================================================
-- Esta consulta integra de forma jerárquica las 7 tablas de HR:
--   1. REGIONS
--   2. COUNTRIES (hijo de REGIONS)
--   3. LOCATIONS (hijo de COUNTRIES)
--   4. DEPARTMENTS (hijo de LOCATIONS)
--   5. EMPLOYEES (hijo de DEPARTMENTS)
--   6. JOBS (relación 1:1 con EMPLOYEES para TrabajoActual)
--   7. JOB_HISTORY (historial de cargos de un empleado)
--
-- Se hace uso extensivo de XMLELEMENT, XMLATTRIBUTES, XMLAGG, XMLFOREST
-- y subconsultas correlacionadas para construir la estructura de árbol.
-- ============================================================================

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
                                            -- Agregamos el nodo HistorialLaboral si existen registros previos del empleado
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
FROM dual;
