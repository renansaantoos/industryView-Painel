import { db } from '../../config/database';
import { UpsertWorkScheduleInput } from './work-schedule.schema';

export class WorkScheduleService {
  static async getByUser(users_id: number) {
    return db.employee_work_schedule.findUnique({
      where: { users_id: BigInt(users_id) },
    });
  }

  static async upsert(users_id: number, input: UpsertWorkScheduleInput) {
    const data = {
      ...input,
      updated_at: new Date(),
    };
    return db.employee_work_schedule.upsert({
      where: { users_id: BigInt(users_id) },
      create: {
        users_id: BigInt(users_id),
        ...data,
      },
      update: data,
    });
  }
}

export default WorkScheduleService;
