import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../prisma';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        avatar: true,
        activeProcesses: true
      },
      orderBy: { name: 'asc' }
    });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Validación básica
    if (!name || !email || !password || !role) {
      res.status(400).json({ error: 'Faltan campos requeridos (name, email, password, role)' });
      return;
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'El correo electrónico ya está registrado' });
      return;
    }

    // Encriptar clave
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generar avatar simple con iniciales
    const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        avatar: initials
      },
      select: { // No devolvemos la contraseña creada
        id: true, name: true, email: true, role: true, isActive: true
      }
    });

    res.status(201).json({ message: 'Usuario creado exitosamente', user: newUser });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, role, isActive } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { 
        name: name !== undefined ? name : undefined, 
        role: role !== undefined ? role : undefined, 
        isActive: isActive !== undefined ? Boolean(isActive) : undefined 
      },
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });

    res.json({ message: 'Usuario actualizado', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Si la regla de negocio lo exige, en un sistema real preferimos desactivar (isActive=false) 
    // antes de borrar el registro físico para no romper transacciones atadas al usuario.
    // Sin embargo, proveemos el endpoint de eliminación física como pidió el administrador.
    
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'Usuario eliminado físicamente del sistema' });
  } catch (error) {
    // Error genérico suele pasar si hay relacion restrictiva en base de datos.
    res.status(500).json({ error: 'No se puede eliminar el usuario. Es posible que tenga procesos asignados. Considere desactivarlo.' });
  }
};
