const commands = new Map();

/**
 * Registers a new command with its handler function.
 * @param {string} name - The name of the command (e.g., "hi")
 * @param {function} handler - The function to execute when the command is called
 */


const newCommand = (name, handler, options = {}) => {
  if (typeof handler !== "function") {
    console.error(`❌ newCommand "${name}" handler is not a function:`, typeof handler, handler);
    return;
  }

  commands.set(name.toLowerCase(), {
    handler,
    description: options.description || "",
  });
};

/**
 * Retrieves a registered command handler by name.
 * @param {string} name - The command name
 * @returns {object|null} - The command object or null if not found
 */
function getCommand(name) {
  return commands.get(name.toLowerCase()) || null;
}

/**
 * Lists all registered command names.
 * @returns {string[]} - Array of command names
 */
function getAllCommands() {
  return [...commands.keys()];
}

module.exports = {
  newCommand,
  getCommand,
  getAllCommands,
  commands
};