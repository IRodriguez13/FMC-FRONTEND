/** True si el café es el local del enterprise autenticado. */
export function isOwnEnterpriseCafeteria(user, cafeteriaId) {
  return (
    user?.role === 'enterprise' &&
    user.cafeteriaId != null &&
    String(user.cafeteriaId) === String(cafeteriaId)
  );
}
