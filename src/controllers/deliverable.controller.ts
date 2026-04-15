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
