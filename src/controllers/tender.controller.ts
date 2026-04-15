import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getTenderProcesses = async (req: Request, res: Response) => {
  try {
    const processes = await prisma.tenderProcess.findMany({
      include: {
        analyst: { select: { name: true, role: true, avatar: true } },
        operator: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(processes);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo procesos' });
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

    // Generar un ID como LP-202X-XXX automáticamente
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    let prefix = 'LP';
    if (modality === 'Selección Abreviada') prefix = 'SA';
    if (modality === 'Concurso de Méritos') prefix = 'CM';
    if (modality === 'Contratación Directa') prefix = 'CD';
    
    const generatedId = `${prefix}-${year}-${random}`;

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
