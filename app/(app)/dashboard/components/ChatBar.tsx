import { InputGroup, InputGroupInput } from '@/components/ui/input-group';

export function ChatBar() {
  return (
    <InputGroup
      id="ember-chat"
      className="rounded-lg p-5 pl-2 pr-2 mr-2 backdrop-blur"
    >
      <InputGroupInput
        placeholder="Ask Ember to do something ..."
        className="placeholder:text-secondary-foreground"
      />
    </InputGroup>
  );
}
