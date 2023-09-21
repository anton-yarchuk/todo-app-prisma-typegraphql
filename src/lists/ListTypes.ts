import { Field, InputType } from 'type-graphql';
import { Length } from 'class-validator';
import { List } from './List';

@InputType()
export class CreateListInput implements Partial<List> {
  @Field()
  @Length(1, 50)
  title: string;
}
