import { ArgsType, Field, InputType, Int } from 'type-graphql';
import { Todo } from './Todo';
import { Length, Min, IsUUID, Max } from 'class-validator';

@InputType()
export class CreateTodoInput implements Partial<Todo> {
  @Field()
  @Length(1, 50)
  title: string;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field({ nullable: true })
  @IsUUID()
  listId?: string;
}

@ArgsType()
export class TodosArgs {
  @Field((type) => Int, { defaultValue: 0 })
  @Min(0)
  skip?: number = 0;

  @Field((type) => Int, { defaultValue: 20 })
  @Min(1)
  @Max(100)
  take?: number = 20;

  @Field({ nullable: true })
  @Length(3, 30)
  titleContains?: string;

  @Field({ nullable: true })
  @IsUUID()
  listId?: string;

  @Field({ nullable: true, defaultValue: true })
  includeCompleted?: boolean;
}
