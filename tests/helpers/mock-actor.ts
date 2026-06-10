/** Test-only actor factory with a single cast to Actor.Implementation. */
export function mockActor(
  overrides: Record<string, unknown> & { id: string; name?: string }
): Actor.Implementation {
  return {
    type: "character",
    name: overrides.name ?? "Test Actor",
    img: "icons/svg/mystery-man.svg",
    uuid: `Actor.${overrides.id}`,
    folder: null,
    ownership: {},
    flags: {},
    system: {},
    prototypeToken: { texture: { src: "" } },
    getFlag: () => undefined,
    testUserPermission: () => true,
    update: async () => mockActor(overrides),
    ...overrides,
  } as unknown as Actor.Implementation;
}
