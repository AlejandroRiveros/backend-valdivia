import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getDeliverables = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    
    // Filtro opcional por estado
    const whereClause = status && status !== 'all' ? { status: String(status) } : {};

    const deliverables = await prisma.deliverable.findMany({
      where: whereClause,
      include: {
        contractor: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Mapeamos para enviar los mismos campos que espera el Frontend del Director
    const mappedDeliverables = deliverables.map(d => ({
      id: d.id,
      contractId: d.contractId,
      contractor: d.contractor.name,
      type: d.type,
      month: d.month,
      submissionDate: d.submissionDate.toISOString().split('T')[0],
      docStatus: d.docStatus,
      balanceStatus: d.balanceStatus,
      status: d.status,
      amount: d.amount
    }));

    res.json(mappedDeliverables);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo los entregables' });
  }
};

export const authorizeDeliverable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { observation } = req.body;

    const deliverable = await prisma.deliverable.findUnique({ where: { id } });

    if (!deliverable) {
      res.status(404).json({ error: 'Entregable no encontrado' });
      return;
    }

    // Reglas de Negocio Estrictas:
    if (deliverable.balanceStatus === 'inconsistent') {
      res.status(403).json({ 
        error: 'Autorización Denegada: Existen inconsistencias en el Balance de Masas.' 
      });
      return;
    }

    if (deliverable.docStatus === 'expired') {
      res.status(403).json({ 
        error: 'Autorización Denegada: La documentación se encuentra vencida.' 
      });
      return;
    }

    const updated = await prisma.deliverable.update({
      where: { id },
      data: {
        status: 'approved',
        observations: observation || 'Autorizado por el Director Operativo'
      }
    });

    res.json({ message: 'Pago Autorizado', deliverable: updated });
  } catch (error) {
    res.status(500).json({ error: 'Error al autorizar el entregable' });
  }
};

export const rejectDeliverable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { observation } = req.body;

    if (!observation) {
      res.status(400).json({ error: 'Debe proveer una observación para rechazar un entregable' });
      return;
    }

    const deliverable = await prisma.deliverable.findUnique({ where: { id } });
    if (!deliverable) {
      res.status(404).json({ error: 'Entregable no encontrado' });
      return;
    }

    const updated = await prisma.deliverable.update({
      where: { id },
      data: {
        status: 'rejected',
        observations: observation
      }
    });

    res.json({ message: 'Entregable Rechazado', deliverable: updated });
  } catch (error) {
    res.status(500).json({ error: 'Error al rechazar el entregable' });
  }
};

export const updateDocStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { docStatus, observation } = req.body;

    const validStatuses = ['valid', 'warning', 'expired'];
    if (!docStatus || !validStatuses.includes(docStatus)) {
      res.status(400).json({ error: 'docStatus debe ser: valid, warning o expired' });
      return;
    }

    const deliverable = await prisma.deliverable.findUnique({ where: { id } });
    if (!deliverable) {
      res.status(404).json({ error: 'Entregable no encontrado' });
      return;
    }

    if (deliverable.status !== 'pending') {
      res.status(403).json({ error: 'Solo se puede revisar documentación de entregables pendientes' });
      return;
    }

    const updated = await prisma.deliverable.update({
      where: { id },
      data: {
        docStatus,
        observations: observation || deliverable.observations,
      }
    });

    res.json({ message: 'Estado documental actualizado', deliverable: updated });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando el estado documental' });
  }
};

export const createDeliverable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contractId, type, month, submissionDate, amount, observations, contractorId } = req.body;

    if (!contractId || !type || !month || !submissionDate || !amount || !contractorId) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }

    const contractor = await prisma.contractor.findUnique({ where: { id: contractorId } });
    if (!contractor) {
      res.status(404).json({ error: 'Contratista no encontrado' });
      return;
    }

    const deliverable = await prisma.deliverable.create({
      data: {
        contractId,
        type,
        month,
        submissionDate: new Date(submissionDate),
        amount: Number(amount),
        observations: observations || null,
        contractorId,
        docStatus: 'pending',
        balanceStatus: 'pending',
        status: 'pending',
      }
    });

    res.status(201).json({ message: 'Entregable registrado', deliverable });
  } catch (error) {
    res.status(500).json({ error: 'Error registrando el entregable' });
  }
};
