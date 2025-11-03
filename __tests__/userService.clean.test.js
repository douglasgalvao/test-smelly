const { UserService } = require('../src/userService');

describe('UserService - clean tests', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  test('createUser stores a new active user with a generated identifier', () => {
    // Arrange
    const nome = 'Fulano de Tal';
    const email = 'fulano@example.com';
    const idade = 30;

    // Act
    const createdUser = userService.createUser(nome, email, idade);
    const storedUser = userService.getUserById(createdUser.id);

    // Assert
    expect(createdUser.id).toEqual(expect.any(String));
    expect(createdUser.createdAt).toBeInstanceOf(Date);
    expect(createdUser).toMatchObject({
      nome,
      email,
      idade,
      isAdmin: false,
      status: 'ativo',
    });
    expect(storedUser).toMatchObject({
      id: createdUser.id,
      nome,
      status: 'ativo',
    });
  });

  test('getUserById returns null when the user does not exist', () => {
    // Arrange
    const nonExistentId = 'unknown-id';

    // Act
    const result = userService.getUserById(nonExistentId);

    // Assert
    expect(result).toBeNull();
  });

  test('deactivateUser marks a regular user as inactive and returns true', () => {
    // Arrange
    const regularUser = userService.createUser('Regular', 'regular@example.com', 28);

    // Act
    const wasDeactivated = userService.deactivateUser(regularUser.id);
    const updatedUser = userService.getUserById(regularUser.id);

    // Assert
    expect(wasDeactivated).toBe(true);
    expect(updatedUser.status).toBe('inativo');
  });

  test('deactivateUser keeps administrators active and returns false', () => {
    // Arrange
    const adminUser = userService.createUser('Admin', 'admin@example.com', 35, true);

    // Act
    const wasDeactivated = userService.deactivateUser(adminUser.id);
    const updatedUser = userService.getUserById(adminUser.id);

    // Assert
    expect(wasDeactivated).toBe(false);
    expect(updatedUser.status).toBe('ativo');
  });

  test('deactivateUser returns false when the user does not exist', () => {
    // Arrange
    const unknownId = 'non-existent-id';

    // Act
    const wasDeactivated = userService.deactivateUser(unknownId);
    const storedUser = userService.getUserById(unknownId);

    // Assert
    expect(wasDeactivated).toBe(false);
    expect(storedUser).toBeNull();
  });

  test('generateUserReport informs when there are no users', () => {
    // Arrange
    userService._clearDB();

    // Act
    const report = userService.generateUserReport();

    // Assert
    expect(report).toContain('--- Relatório de Usuários ---');
    expect(report).toContain('Nenhum usuário cadastrado.');
  });

  test('generateUserReport lists each user with current status', () => {
    // Arrange
    const alice = userService.createUser('Alice', 'alice@example.com', 28);
    const bob = userService.createUser('Bob', 'bob@example.com', 32);
    userService.deactivateUser(bob.id);

    // Act
    const report = userService.generateUserReport();

    // Assert
    expect(report).toContain('--- Relatório de Usuários ---');
    expect(report).toContain(`Nome: ${alice.nome}`);
    expect(report).toContain(`Status: ${alice.status}`);
    expect(report).toContain(`Nome: ${bob.nome}`);
    expect(report).toContain('Status: inativo');
  });

  test('createUser rejects users under the legal age', () => {
    // Arrange
    const nome = 'Teen';
    const email = 'teen@example.com';
    const idade = 16;

    // Act
    const act = () => userService.createUser(nome, email, idade);

    // Assert
    expect(act).toThrow('O usuário deve ser maior de idade.');
  });

  test('createUser requires mandatory fields', () => {
    // Arrange
    const nome = '';
    const email = 'noname@example.com';
    const idade = 22;

    // Act
    const act = () => userService.createUser(nome, email, idade);

    // Assert
    expect(act).toThrow('Nome, email e idade são obrigatórios.');
  });
});
