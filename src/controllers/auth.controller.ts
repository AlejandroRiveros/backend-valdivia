import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const SECRET_KEY = process.env.JWT_SECRET || 'valdivia-super-secret-key';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son requeridos' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: 'Su cuenta ha sido desactivada. Contacte al administrador.' });
      return;
    }

    // Verificar contraseña encriptada
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    // Generar JSON Web Token
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      SECRET_KEY,
      { expiresIn: '8h' } // El token expira en 8 horas
    );

    // Ocultar el password en la respuesta
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor durante el login' });
  }
};
