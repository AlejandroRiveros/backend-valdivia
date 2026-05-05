import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getTenderProcesses = async (req: Request, res: Response) => {
  try {
    const { supervisorId } = req.query;
    const where = supervisorId ? { supervisorId: String(supervisorId) } : {};

    const processes = await prisma.tenderProcess.findMany({
      where,
      include: {
        analyst: { select: { name: true, role: true, avatar: true } },
        operator: { select: { name: true } },
        supervisor: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(processes);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo procesos' });
  }
};

export const assignSupervisor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { supervisorId } = req.body;

    const process = await prisma.tenderProcess.findUnique({ where: { id } });
    if (!process) {
      res.status(404).json({ error: 'Proceso no encontrado' });
      return;
    }

    if (supervisorId !== null && supervisorId !== undefined) {
      const user = await prisma.user.findUnique({ where: { id: supervisorId } });
      if (!user || user.role !== 'SUPERVISOR') {
        res.status(400).json({ error: 'El usuario no existe o no tiene rol SUPERVISOR' });
        return;
      }
    }

    const updated = await prisma.tenderProcess.update({
      where: { id },
      data: { supervisorId: supervisorId ?? null },
      include: { supervisor: { select: { id: true, name: true } } }
    });

    res.json({ message: 'Supervisor asignado', process: updated });
  } catch (error) {
    res.status(500).json({ error: 'Error asignando supervisor' });
  }
};

export const createTenderProcess = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      name, entity, modality, budget, description, 
      startDate, endDate, analystId, operatorId, 
      supervisorRole, accessLevel 
    } = req.body;

    // Validación básica de fechas
    if (new Date(startDate) > new Date(endDate)) {
      res.status(400).json({ error: 'La fecha de inicio debe ser anterior a la de cierre' });
      return;
    }

    const year = new Date().getFullYear();
    let prefix = 'LP';
    if (modality === 'Selección Abreviada') prefix = 'SA';
    if (modality === 'Concurso de Méritos') prefix = 'CM';
    if (modality === 'Contratación Directa') prefix = 'CD';

    const count = await prisma.tenderProcess.count({
      where: { generatedId: { startsWith: `${prefix}-${year}` } }
    });
    const generatedId = `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;

    const newProcess = await prisma.tenderProcess.create({
      data: {
        generatedId,
        name,
        entity,
        modality,
        budget: Number(budget),
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        supervisorRole: Boolean(supervisorRole),
        accessLevel,
        analystId,
        operatorId: operatorId || null
      }
    });

    res.status(201).json({ 
      message: 'Proceso creado exitosamente',
      process: newProcess
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno guardando el proceso' });
  }
};
