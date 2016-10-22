import interfaces from "../../src/interfaces/interfaces";
import { expect } from "chai";
import Lookup from "../../src/kernel/lookup";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import Binding from "../../src/bindings/binding";
import BindingScope from "../../src/bindings/binding_scope";

describe("Lookup", () => {

  it("Should throw when invoking get, remove or hasKey with a null key", () => {
    let lookup = new Lookup<any>();
    expect(() => { lookup.get(null); }).to.throw(ERROR_MSGS.NULL_ARGUMENT);
    expect(() => { lookup.remove(null); }).to.throw(ERROR_MSGS.NULL_ARGUMENT);
    expect(() => { lookup.hasKey(null); }).to.throw(ERROR_MSGS.NULL_ARGUMENT);
  });

  it("Should throw when attempting to add a null key", () => {
    let lookup = new Lookup<any>();
    expect(() => { lookup.add(null, 1); }).to.throw(ERROR_MSGS.NULL_ARGUMENT);
  });

  it("Should throw when attempting to add a null value", () => {
    let lookup = new Lookup<any>();
    expect(() => { lookup.add("TEST_KEY", null); }).to.throw(ERROR_MSGS.NULL_ARGUMENT);
  });

  it("Should be able to link multiple values to a string key", () => {
    let lookup = new Lookup<any>();
    let key = "TEST_KEY";
    lookup.add(key, 1);
    lookup.add(key, 2);
    let result = lookup.get(key);
    expect(result.length).to.eql(2);
  });

  it("Should be able to link multiple values a symbol key", () => {
    let lookup = new Lookup<any>();
    let key = Symbol("TEST_KEY");
    lookup.add(key, 1);
    lookup.add(key, 2);
    let result = lookup.get(key);
    expect(result.length).to.eql(2);
  });

  it("Should throws when key not found", () => {
    let lookup = new Lookup<any>();
    expect(() => { lookup.get("THIS_KEY_IS_NOT_AVAILABLE"); }).to.throw(ERROR_MSGS.KEY_NOT_FOUND);
    expect(() => { lookup.remove("THIS_KEY_IS_NOT_AVAILABLE"); }).to.throw(ERROR_MSGS.KEY_NOT_FOUND);
  });

  it("Should be clonable", () => {

    let lookup = new Lookup<interfaces.Clonable<any>>();
    let key1 = Symbol("TEST_KEY");

    class Warrior {
      public kind: string;
      public constructor(kind: string) {
        this.kind = kind;
      }
      public clone() {
        return new Warrior(this.kind);
      }
    }

    lookup.add(key1, new Warrior("ninja"));
    lookup.add(key1, new Warrior("samurai"));

    let copy = lookup.clone();
    expect(copy.hasKey(key1)).to.eql(true);

    lookup.remove(key1);
    expect(copy.hasKey(key1)).to.eql(true);

  });

  it("Should be able to remove a binding by the identifier of its module", () => {

    let moduleId1 = "moduleId1";
    let moduleId2 = "moduleId2";
    let warriorId = "Warrior";
    let weaponId = "Weapon";

    let getLookup = () => {

      interface Warrior {}

      class Ninja implements Warrior {}
      let ninjaBinding = new Binding(warriorId, BindingScope.Transient);
      ninjaBinding.implementationType = Ninja;
      ninjaBinding.moduleId = moduleId1;

      class Samurai implements Warrior {}
      let samuraiBinding = new Binding(warriorId, BindingScope.Transient);
      samuraiBinding.implementationType = Samurai;
      samuraiBinding.moduleId = moduleId2;

      interface Weapon {}

      class Shuriken implements Weapon {}
      let shurikenBinding = new Binding(weaponId, BindingScope.Transient);
      shurikenBinding.implementationType = Shuriken;
      shurikenBinding.moduleId = moduleId1;

      class Katana implements Weapon {}
      let katanaBinding = new Binding(weaponId, BindingScope.Transient);
      katanaBinding.implementationType = Katana;
      katanaBinding.moduleId = moduleId2;

      let lookup = new Lookup<Binding<any>>();
      lookup.add(warriorId, ninjaBinding);
      lookup.add(warriorId, samuraiBinding);
      lookup.add(weaponId, shurikenBinding);
      lookup.add(weaponId, katanaBinding);

      return lookup;

    };

    let lookup1 = getLookup();
    expect(lookup1.hasKey(warriorId)).to.eql(true);
    expect(lookup1.hasKey(weaponId)).to.eql(true);
    expect(lookup1.get(warriorId).length).to.eql(2);
    expect(lookup1.get(weaponId).length).to.eql(2);
    lookup1.removeByModuleId(moduleId1);
    expect(lookup1.hasKey(warriorId)).to.eql(true);
    expect(lookup1.hasKey(weaponId)).to.eql(true);
    expect(lookup1.get(warriorId).length).to.eql(1);
    expect(lookup1.get(weaponId).length).to.eql(1);

    let lookup2 = getLookup();
    expect(lookup2.hasKey(warriorId)).to.eql(true);
    expect(lookup2.hasKey(weaponId)).to.eql(true);
    expect(lookup2.get(warriorId).length).to.eql(2);
    expect(lookup2.get(weaponId).length).to.eql(2);
    lookup2.removeByModuleId(moduleId1);
    lookup2.removeByModuleId(moduleId2);
    expect(lookup2.hasKey(warriorId)).to.eql(false);
    expect(lookup2.hasKey(weaponId)).to.eql(false);

  });

});
