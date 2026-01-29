// paginareact/Backend/services/badgeService.js
const db = require('../models'); // Importa todos tus modelos de Sequelize

/**
 * Función para otorgar una insignia a un usuario si cumple con los criterios
 * y aún no la tiene.
 * @param {number} userId - ID del usuario.
 * @param {object} criteriaContext - Objeto con datos del evento que desencadena la verificación (ej. { type: 'review', reviewCount: 1, ... }).
 * @returns {Promise<Array<object>>} - Promesa que resuelve a un array de insignias otorgadas.
 */
async function awardBadgesIfCriteriaMet(userId, criteriaContext) {
    const awardedBadges = [];
    let transaction; // Para manejar transacciones si fuera necesario

    try {
        // Iniciar una transacción para asegurar la consistencia si hay múltiples operaciones de DB
        transaction = await db.sequelize.transaction();

        // 1. Obtener todas las insignias disponibles y sus criterios
        const allBadges = await db.Badge.findAll({ transaction });

        // 2. Obtener las insignias que el usuario ya tiene
        const userExistingBadges = await db.UserBadge.findAll({
            where: { userId: userId },
            attributes: ['badgeId'], // Solo necesitamos el ID de la insignia
            transaction
        });
        const userExistingBadgeIds = new Set(userExistingBadges.map(ub => ub.badgeId));

        // 3. Iterar sobre cada insignia y verificar si el usuario la califica
        for (const badge of allBadges) {
            // Si el usuario ya tiene esta insignia, la saltamos
            if (userExistingBadgeIds.has(badge.id)) {
                // console.log(`Usuario ${userId} ya tiene la insignia ${badge.name}.`);
                continue;
            }

            const badgeCriteria = badge.criteria; // badge.criteria ya es un objeto JSON gracias a DataTypes.JSON

            // Verificar si el contexto actual desencadena este tipo de criterio
            if (badgeCriteria.type === criteriaContext.type) {
                let meetsCriteria = false;

                switch (badgeCriteria.type) {
                    case 'purchase_count':
                        // Ejemplo: "Primer Lector" - Has completado tu primera compra de libro.
                        // criteriaContext = { type: 'purchase_count', currentPurchaseCount: 1 }
                        if (criteriaContext.currentPurchaseCount >= badgeCriteria.value) {
                            meetsCriteria = true;
                        }
                        break;
                    case 'review_count':
                        // Ejemplo: "Crítico Novato" - Has dejado tu primera reseña.
                        // criteriaContext = { type: 'review_count', currentReviewCount: 1, userId: ... }
                        // Para esta insignia, necesitamos contar las reseñas del usuario.
                        const reviewsCount = await db.Review.count({
                            where: { user_id: userId },
                            transaction
                        });
                        if (reviewsCount >= badgeCriteria.value) {
                            meetsCriteria = true;
                        }
                        break;
                    case 'new_release_purchase':
                        // Ejemplo: "Madrugador Literario" - Has comprado un libro en los primeros X días de su lanzamiento.
                        // NOTA: Esta lógica es más compleja y depende de cómo manejes las compras y las fechas de lanzamiento.
                        // Asumimos que `criteriaContext.isNewReleasePurchase` y `criteriaContext.daysSinceRelease` ya vienen calculados.
                        if (criteriaContext.isNewReleasePurchase && criteriaContext.daysSinceRelease <= badgeCriteria.days) {
                            meetsCriteria = true;
                        }
                        break;
                    case 'genre_read_count':
                        // Ejemplo: "Explorador de Géneros"
                        // NOTA: Necesitas una forma de saber los géneros que un usuario ha leído (ej. a través de compras o libros en su biblioteca).
                        // Asumimos que `criteriaContext.uniqueGenresCount` ya viene con el número de géneros únicos leídos.
                        if (criteriaContext.uniqueGenresCount >= badgeCriteria.value) {
                            meetsCriteria = true;
                        }
                        break;
                    case 'author_read_count':
                        // Ejemplo: "Fanático del Autor"
                        // NOTA: Similar a los géneros, necesitas contar libros de un autor específico para el usuario.
                        // Asumimos que `criteriaContext.booksByAuthorCount` ya viene con el número de libros de un autor específico.
                        if (criteriaContext.booksByAuthorCount >= badgeCriteria.value) {
                            meetsCriteria = true;
                        }
                        break;
                    case 'collection_size':
                        // Ejemplo: "Biblioteca en Crecimiento"
                        // NOTA: Necesitas contar los libros comprados por el usuario.
                        // Asumimos que `criteriaContext.currentCollectionSize` ya viene con el número total de libros comprados.
                        if (criteriaContext.currentCollectionSize >= badgeCriteria.value) {
                            meetsCriteria = true;
                        }
                        break;
                    // Añade más casos para otros tipos de criterios si los tienes
                    default:
                        console.warn(`Criterio de insignia no reconocido o no implementado: ${badgeCriteria.type}`);
                        break;
                }

                // Después de verificar el criterio base, verifica si la insignia es de nivel
                if (meetsCriteria && badge.baseBadgeId) {
                    const baseBadgeExists = userExistingBadgeIds.has(badge.baseBadgeId);
                    if (!baseBadgeExists) {
                        // No cumple el requisito de nivel previo, no otorgar esta insignia (aún)
                        // console.log(`Usuario ${userId} no puede obtener ${badge.name} sin su base ${badge.baseBadgeId}.`);
                        meetsCriteria = false; // Invalidar el cumplimiento de criterio
                    }
                }

                // Otorgar la insignia si cumple todos los requisitos
                if (meetsCriteria) {
                    await db.UserBadge.create({
                        userId: userId,
                        badgeId: badge.id,
                        dateEarned: new Date()
                    }, { transaction });
                    awardedBadges.push(badge);
                    console.log(`🎉 ¡Usuario ${userId} ganó la insignia: ${badge.name}!`);
                }
            }
        }

        await transaction.commit(); // Confirma la transacción si todo fue bien
        return awardedBadges;

    } catch (error) {
        if (transaction) await transaction.rollback(); // Revierte la transacción si hubo un error
        console.error('Error al otorgar insignias:', error);
        throw new Error('Error interno al procesar insignias.');
    }
}

module.exports = {
    awardBadgesIfCriteriaMet
};