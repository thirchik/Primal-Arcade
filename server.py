from app import app, db
from flask import jsonify, render_template
import utility
import os

@app.route('/')
def page_index():
    return render_template('welcomepage.html')

@app.route('/main')
def page_main():
    user = utility.get_default_user()
    return render_template(
        'mainpage.html', 
        user=user, 
        mutations=user.mutations, 
        items=user.items,
        roles=user.roles,
        active_role=user.active_role.as_dict()
    )

@app.route('/mutations')
def page_mutations():
    user = utility.get_default_user()
    return render_template(
        'mutationspage.html', 
        user=user.as_dict(),
        spin_cost={ 'DNA': utility.DNA_SPIN_COST, 'STARDUST': utility.STARDUST_SPIN_COST }
    )

@app.post('/api/spin/dna')
def api_spin_dna():
    user = utility.get_default_user()

    if(user.dna_amount < utility.DNA_SPIN_COST):
        return {'message': 'You don\'t have enough DNA'}, 400
    
    user.dna_amount -= utility.DNA_SPIN_COST;

    mutation = utility.spin_dna(user.id)
    user.mutations.append(mutation)
    db.session.commit()

    return jsonify(mutation.as_dict())

@app.post('/api/spin/stardust')
def api_spin_stardust():
    user = utility.get_default_user()

    if(user.stardust_amount < utility.STARDUST_SPIN_COST):
        return {'message': 'You don\'t have enough Stardust'}, 400
    
    user.stardust_amount -= utility.STARDUST_SPIN_COST;

    mutation = utility.spin_stardust(user.id)
    user.mutations.append(mutation)
    db.session.commit()

    return jsonify(mutation.as_dict())

@app.put('/api/mutation/<id>/activate')
def api_activate_mutation(id: str):
    id_num = int(id)
    user = utility.get_default_user()

    for mutation in user.mutations:
        mutation.is_active = False

    mutation = next(filter(lambda m: m.id == id_num, user.mutations), None)

    if mutation == None:
        return {'message': f'Mutation with id \'{id}\' not found'}, 404
    
    if mutation.is_active:
        return {'message': 'Mutation is already applied'}, 400
    
    mutation.is_active = True
    db.session.commit()

    return jsonify(mutation.as_dict())

@app.put('/api/mutation/<id>/upgrade')
def api_upgrade_mutation(id: str):
    id_num = int(id)
    user = utility.get_default_user()

    mutation = next(filter(lambda m: m.id == id_num, user.mutations), None)

    if mutation == None:
        return {'message': f'Mutation with id \'{id}\' not found'}, 404
    
    if mutation.is_upgraded:
        return {'message': 'Mutation is already applied'}, 400
    
    if user.rna_amount < utility.MUTATIOM_UPGRADE_COST:
        return {'message': 'You don\'t have enough RNA to upgrade'}, 400
    
    user.rna_amount -= utility.MUTATIOM_UPGRADE_COST
    mutation.is_upgraded = True
    db.session.commit()

    return jsonify(mutation.as_dict())

@app.put('/api/role/<id>/activate')
def api_activate_role(id: str):
    id_num = int(id)
    user = utility.get_default_user()

    if user.active_role_id == id_num:
        return {'message': 'Role is already active'}, 400

    role = next(filter(lambda r: r.id == id_num, user.roles), None)

    if role == None:
        return {'message': f'Role with id \'{id}\' not found'}, 404
    
    user.active_role_id = role.id
    db.session.commit()

    return jsonify(role.as_dict())

@app.put('/api/item/<id>/use')
def api_use_item(id: str):
    id_num = int(id)
    user = utility.get_default_user()

    item = next(filter(lambda i: i.id == id_num, user.items), None)

    if item == None:
        return {'message': 'You don\'t own this item'}, 404
    
    if item.count > 1:
        item.count -= 1
    else:
        user.items.remove(item)

    db.session.commit()

    return item

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=os.environ['PORT'])