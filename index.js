const express = require("express")

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "appclinicaprueba@gmail.com",
    pass: "kqnx julr zrtl qoxa",
  },
});  
  
const mysql = require("mysql2")
const bodyParser = require("body-parser")

const app = express()
const PUERTO = 3000

app.use(bodyParser.json())

app.listen(PUERTO,()=>{
    console.log("Servidor corriendo en el puerto "+ PUERTO)
})

const conexion = mysql.createConnection(
    {
        host: 'localhost',
        database: 'app_clinica',
        user: 'root',
        password: 'root',
        port: 3306
    }
)

conexion.connect(error =>{
    if(error) throw error
    console.log("Conexion exitosa a la base de datos")
})

app.get("/",(req,res)=>{
    res.send("Bienvenido a mi servicio web")
})

function enviarCorreo(destinatario, fecha, hora) {
  const mailOptions = {
    from: '"Clínica Salud Total" <appclinicaprueba@gmail.com>',
    to: destinatario,
    subject: "Confirmación de tu cita médica",
    html: `
      <h2 style="color: #2e86de;">¡Cita médica confirmada!</h2>
      <p>Tu cita ha sido registrada con éxito.</p>
      <p><strong>Fecha:</strong> ${fecha}</p>
      <p><strong>Hora:</strong> ${hora}</p>
      <p>Gracias por confiar en nuestra clínica.</p>
      <hr/>
      <footer style="font-size: 0.9em; color: #888; margin-top: 20px;">
        <p><strong>Clínica Salud Total</strong> – Sistema de Citas</p>
        <p>Este es un mensaje automático, no respondas a este correo.</p>
      </footer>
    `,
    headers: {
      'X-Mailer': 'Clínica Salud Total - Sistema de Citas',
      'X-Priority': '3',
      'X-MSMail-Priority': 'Normal'
    }
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error al enviar correo:", error);
    } else {
      console.log("Correo enviado:", info.response);
    }
  });
}

function enviarCorreoBienvenida(destinatario, nombre) {
  const mailOptions = {
    from: '"Clínica Salud Total" <appclinicaprueba@gmail.com>',
    to: destinatario,
    subject: "Bienvenido a Clínica Salud Total",
    html: `
      <h2 style="color: #2e86de;">¡Bienvenido, ${nombre}!</h2>
      <p>Tu registro en <strong>Clínica Salud Total</strong> ha sido exitoso.</p>
      <p>Ahora puedes ingresar a la aplicación y comenzar a programar tus citas médicas de forma rápida y segura.</p>
      <p>Estamos felices de tenerte con nosotros.</p>
      <hr/>
      <footer style="font-size: 0.9em; color: #888; margin-top: 20px;">
        <p><strong>Clínica Salud Total</strong> – Sistema de Registro</p>
        <p>Este es un mensaje automático, no respondas a este correo.</p>
      </footer>
    `,
    headers: {
      'X-Mailer': 'Clínica Salud Total - Sistema de Registro',
      'X-Priority': '3',
      'X-MSMail-Priority': 'Normal'
    }
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error al enviar correo de bienvenida:", error);
    } else {
      console.log("Correo de bienvenida enviado:", info.response);
    }
  });
}

function enviarCorreoRecuperacion(destinatario, nombre, contrasena) {
  const mailOptions = {
    from: '"Clínica Salud Total" <appclinicaprueba@gmail.com>',
    to: destinatario,
    subject: "Recuperación de contraseña - Clínica Salud Total",
    html: `
      <h2 style="color: #e74c3c;">Recuperación de contraseña</h2>
      <p>Hola <strong>${nombre}</strong>, has solicitado recuperar tu contraseña.</p>
      <p><strong>Tu contraseña actual es:</strong> ${contrasena}</p>
      <p>Te recomendamos cambiarla una vez inicies sesión.</p>
      <hr/>
      <footer style="font-size: 0.9em; color: #888; margin-top: 20px;">
        <p><strong>Clínica Salud Total</strong> – Sistema Atención al Cliente</p>
        <p>Este es un mensaje automático, no respondas a este correo.</p>
      </footer>
    `,
    headers: {
      'X-Mailer': 'Clínica Salud Total - Recuperación de Contraseña',
      'X-Priority': '3',
      'X-MSMail-Priority': 'Normal'
    }
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error al enviar correo de recuperación:", error);
        reject(error);
      } else {
        console.log("Correo de recuperación enviado:", info.response);
        resolve(info);
      }
    });
  });
}

app.get("/usuarios",(req,res)=>{
    const consulta = "SELECT * FROM usuarios"
    conexion.query(consulta,(error,rpta) =>{
        if(error) return console.log(error.message)

            const obj = {}
            if(rpta.length > 0){
                obj.listaUsuarios = rpta
                res.json(obj)
            }else{
                res.json({ mensaje: "no hay registros" })
            }
    })
})

app.get("/especialidades",(req,res)=>{
    const consulta = "SELECT * FROM especialidades"
    conexion.query(consulta,(error,rpta) =>{
        if(error) return console.log(error.message)

            const obj = {}
            if(rpta.length > 0){
                obj.listaEspecialidades = rpta
                res.json(obj)
            }else{
              res.json({ mensaje: "no hay registros" })
            }
    })
})

app.get("/usuario/:correo", (req, res) => {
  const correo = decodeURIComponent(req.params.correo); // decodificar por si acaso
  const consulta = "SELECT * FROM usuarios WHERE usuario_correo = ?";
  conexion.query(consulta, [correo], (error, rpta) => {
      if (error) return res.status(500).send(error.message);
      if (rpta.length > 0) {
          res.json(rpta[0]);
      } else {
          res.status(404).send({ mensaje: "no hay registros" });
      }
  });
});

app.get("/horarios/:parametro",(req,res)=>{
    const valores = req.params.parametro.split("&");
    const fecha = valores[0]
    const especialidad = valores[1]
    const consulta = "select *,time_format(h.horario_hora,'%H:%i') as horario_horas from horarios_medicos h "+
    "inner join medicos m on h.id_medico=m.id_medico "+
    "inner join especialidades e on e.id_especialidad=m.id_especialidad "+
    "where h.horario_fecha ='"+fecha+"' and m.id_especialidad="+especialidad+
    " and h.horario_estado = 0 order by h.horario_hora asc"
    console.log(consulta)
    conexion.query(consulta,(error,rpta) =>{
        if(error) return console.log(error.message)

            const obj = {}
            if(rpta.length > 0){
                obj.listaHorarios = rpta
                res.json(obj)
            }else{
              obj.listaHorarios = []
              res.json(obj)              
            }
    })
})

app.post("/usuario/agregar", (req, res) => {
  const usuario = {
    usuario_dni: req.body.usuario_dni,
    usuario_nombre: req.body.usuario_nombre,
    usuario_apellido: req.body.usuario_apellido,
    usuario_correo: req.body.usuario_correo,
    usuario_contrasena: req.body.usuario_contrasena
  };

  // Validaciones
  if (!usuario.usuario_dni || !/^\d{8}$/.test(usuario.usuario_dni)) {
    return res.status(400).json("El DNI debe tener exactamente 8 dígitos numéricos.");
  }

  if (!usuario.usuario_nombre || !usuario.usuario_apellido) {
    return res.status(400).json("Nombre y apellido son obligatorios.");
  }

  if (
    !usuario.usuario_correo ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.usuario_correo)
  ) {
    return res.status(400).json("Correo electrónico no válido.");
  }

  if (!usuario.usuario_contrasena || usuario.usuario_contrasena.length < 6) {
    return res.status(400).json("La contraseña debe tener al menos 6 caracteres.");
  }

  const consulta = "INSERT INTO usuarios SET ?";
  conexion.query(consulta, usuario, (error) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") {
        if (error.sqlMessage.includes('unique_dni')) {
          return res.status(400).json("El DNI ya está registrado.");
        } else if (error.sqlMessage.includes('usuario_correo')) {
          return res.status(400).json("El correo ya está registrado.");
        } else {
          return res.status(400).json("Datos duplicados en campos únicos.");
        }
      }

      return res.status(500).json("Error al registrar usuario.");
    }

    const nombreCompleto = `${usuario.usuario_nombre} ${usuario.usuario_apellido}`;
    enviarCorreoBienvenida(usuario.usuario_correo, nombreCompleto);

    res.json("Usuario registrado correctamente.");
  });
});

// Este devuelve el correo basado en dni, nombre y apellido
app.post("/usuario/recuperar-correo", (req, res) => {
  const { usuario_dni, usuario_nombre, usuario_apellido } = req.body;
  const consulta = `
    SELECT usuario_correo FROM usuarios
    WHERE usuario_dni = ? AND usuario_nombre = ? AND usuario_apellido = ?
  `;
  conexion.query(consulta, [usuario_dni, usuario_nombre, usuario_apellido], (error, resultados) => {
    if (error) return res.status(500).json({ error: "Error interno del servidor" });
    if (resultados.length === 0) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    res.json({ correo: resultados[0].usuario_correo });
  });
});


app.post("/usuario/recuperar-contrasena", (req, res) => {
  const { usuario_correo } = req.body;

  const consulta = "SELECT usuario_nombre, usuario_apellido, usuario_contrasena FROM usuarios WHERE usuario_correo = ?";
  conexion.query(consulta, [usuario_correo], (error, resultados) => {
    if (error) {
      console.error("Error consultando usuario:", error.message);
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    if (resultados.length === 0) {
      return res.status(404).json({ mensaje: "Correo no registrado" });
    }

    const usuario = resultados[0];
    const nombreCompleto = `${usuario.usuario_nombre} ${usuario.usuario_apellido}`;
    enviarCorreoRecuperacion(usuario_correo, nombreCompleto, usuario.usuario_contrasena);
    res.json({ mensaje: "Correo de recuperación enviado" });
  });
});

  
  app.post("/cita/agregar", (req, res) => {
    const cita = {
      id_usuario: req.body.id_usuario,
      id_medico: req.body.id_medico,
      cita_fecha: req.body.cita_fecha,
      cita_hora: req.body.cita_hora,
    };
  
    const consultaInsert = "INSERT INTO citas SET ?";
    conexion.query(consultaInsert, cita, (error) => {
      if (error) return console.error(error.message);
  
      // Aquí buscamos el correo del usuario desde la base de datos
      const consultaCorreo = "SELECT usuario_correo FROM usuarios WHERE id_usuario = ?";
      conexion.query(consultaCorreo, [cita.id_usuario], (error2, results) => {
        if (error2) {
          console.error("Error buscando correo:", error2.message);
          return res.status(500).json({ error: "Error interno al obtener el correo" });
        }
  
        if (results.length === 0) {
          console.warn("No se encontró el correo para el usuario:", cita.id_usuario);
          return res.status(404).json({ error: "Usuario no encontrado" });
        }
  
        const destinatario = results[0].usuario_correo;
        console.log("Correo destinatario encontrado en BD:", destinatario);
  
        enviarCorreo(destinatario, cita.cita_fecha, cita.cita_hora);
        res.json("Cita registrada correctamente");
      });
    });
  });

app.put("/horario/actualizar/:id_horario",(req,res)=>{
    const {id_horario} = req.params
    const consulta = "UPDATE horarios_medicos SET horario_estado = 1 WHERE id_horario="+id_horario+""
    conexion.query(consulta,(error,rpta) =>{
        if(error) return console.error(error.message)
        res.json("Horario actualizado correctamente")
    })
})

app.get("/citas/:usuario",(req,res)=>{
    const {usuario} = req.params
    const consulta = "select c.id_cita,c.id_usuario,c.id_medico,date_format(c.cita_fecha, '%d/%m/%Y') "+
    "as cita_fecha,time_format(c.cita_hora,'%H:%i') as cita_hora, m.medico_nombre,m.medico_apellido,"+
    "e.id_especialidad,e.especialidad_nombre,c.cita_estado from citas c inner join medicos m on "+
    "c.id_medico=m.id_medico inner join especialidades e "+
    "on m.id_especialidad=e.id_especialidad where id_usuario ="+usuario+
    " order by cita_fecha,cita_hora desc"
    conexion.query(consulta,(error,rpta) =>{
        if(error) return console.log(error.message)

            const obj = {}
            if(rpta.length > 0){
                obj.listaCitas = rpta
                res.json(obj)
            }else{
              obj.listaCitas = []
              res.json(obj)              
            }
    })
})

app.get("/citamedica/:id_cita", (req, res) => {
    const { id_cita } = req.params;
    console.log('id_cita recibido:', id_cita);  
    
    const consulta = `
   SELECT 
    cit.id_cita AS IdCita,
    CONCAT(us.usuario_nombre, ' ', us.usuario_apellido) AS UsuarioCita,
    esp.especialidad_nombre AS Especialidad,
    CONCAT(med.medico_nombre, ' ', med.medico_apellido) AS Medico,
    cit.cita_fecha AS FechaCita,
    cit.cita_hora AS HoraCita
    FROM citas cit
    INNER JOIN usuarios us ON us.id_usuario = cit.id_usuario
    INNER JOIN medicos med ON med.id_medico = cit.id_medico
    INNER JOIN especialidades esp ON esp.id_especialidad = med.id_especialidad
    WHERE cit.id_cita = ?`; 

 
    conexion.query(consulta, [id_cita], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error en la base de datos" });
        }
   
        if (results.length === 0) {
            return res.status(404).json({ mensaje: "Cita no encontrada" });
        }
        

        res.json(results[0]);
    });
});


app.put("/cita/anular/:id_cita", (req, res) => {
    const { id_cita } = req.params;
    console.log('id_cita recibido:', id_cita);
    const consulta = "UPDATE citas SET cita_estado = 0 WHERE id_cita = ?";

    conexion.query(consulta, [id_cita], (error, results) => {
        if (error) {
            console.error(error.message);
            return res.status(500).json({ error: "Error al cancelar la cita" });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Cita no encontrada" });
        }

        res.json({ mensaje: "Cita cancelada correctamente" });
    });
});


app.get("/citas",(req,res)=>{
    const consulta = `
        SELECT 
            c.id_cita,
            u.usuario_nombre,
            u.usuario_apellido,
            DATE_FORMAT(c.cita_fecha, '%d/%m/%Y') AS cita_fecha,
            TIME_FORMAT(c.cita_hora, '%H:%i') AS cita_hora,
            e.especialidad_nombre,
            m.medico_nombre,
            m.medico_apellido,
            c.cita_estado
        FROM citas c 
        INNER JOIN usuarios u ON c.id_usuario = u.id_usuario 
        INNER JOIN medicos m ON c.id_medico = m.id_medico
        INNER JOIN especialidades e ON m.id_especialidad = e.id_especialidad
        ORDER BY c.cita_fecha DESC, c.cita_hora DESC
    `;
    conexion.query(consulta,(error,rpta) =>{
        if(error) return console.log(error.message)

            const obj = {}
            if(rpta.length > 0){
                obj.listaCitas = rpta
                res.json(obj)
            }else{
              res.json({ mensaje: "no hay registros" })
            }
    })
})


app.get("/medicos",(req,res)=>{
    const consulta = "SELECT * FROM medicos"
    conexion.query(consulta,(error,rpta) =>{
        if(error) return console.log(error.message)

            const obj = {}
            if(rpta.length > 0){
                obj.listaCitas = rpta
                res.json(obj)
            }else{
              res.json({ mensaje: "no hay registros" })
            }
    })
})