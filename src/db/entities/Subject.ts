import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Semester, Exam } from './';
import { BaseEntity } from './BaseEntity';

@Entity('subject')
export class Subject extends BaseEntity {
  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  teacher!: string | null;

  @Column({ type: 'float', default: 1.0 })
  weight!: number;

  @Column({ type: 'uuid' })
  semesterId!: string;

  @ManyToOne(() => Semester, (semester) => semester.subjects, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'semesterId' })
  semester!: Semester;

  @OneToMany(() => Exam, (exam) => exam.subject, { cascade: true })
  exams!: Exam[];
}
