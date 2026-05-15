import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1715000000000 implements MigrationInterface {
  name = 'InitialSchema1715000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "user_role" AS ENUM('Requester', 'Validator')`);
    await queryRunner.query(
      `CREATE TYPE "vacation_request_status" AS ENUM('Pending', 'Approved', 'Rejected')`,
    );

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(100) NOT NULL,
        "role" "user_role" NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "vacation_requests" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "start_date" DATE NOT NULL,
        "end_date" DATE NOT NULL,
        "reason" TEXT,
        "status" "vacation_request_status" NOT NULL DEFAULT 'Pending',
        "comments" TEXT,
        "validator_id" INTEGER,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_vacation_requests_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_vacation_requests_validator"
          FOREIGN KEY ("validator_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_vacation_requests_user_id" ON "vacation_requests" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_vacation_requests_status" ON "vacation_requests" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_vacation_requests_status_user_id" ON "vacation_requests" ("status", "user_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_vacation_requests_status_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_vacation_requests_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_vacation_requests_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vacation_requests"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "vacation_request_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role"`);
  }
}
